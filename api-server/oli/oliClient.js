/**
 * oliClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single interface for OLI corrosion calculations.
 * Set OLI_MOCK=false in .env to switch from mock → live OLI Cloud.
 *
 * Live OLI Engine API flow:
 *   1. Authenticate  → GET Bearer token (oliAuth.js)
 *   2. Upload .dbs   → POST /api/v1/flash/dbs        (one-time per session)
 *   3. Calculate     → POST /api/v1/flash/corrosion
 *   4. Parse result  → normalize to our internal shape
 *
 * OLI Engine API base URL:
 *   https://cloud.olisystems.com/api/v1
 *
 * Required .env variables for live mode:
 *   OLI_MOCK=false
 *   OLI_USERNAME=your@email.com
 *   OLI_PASSWORD=yourpassword
 *   OLI_DBS_PATH=./oli/refinery.dbs   (path to your chemistry model file)
 */

const { getToken }          = require("./oliAuth");
const { runMockCalculation } = require("./oliMock");
const { UNIT_MODELS }        = require("./corrosionModels");
const path = require("path");
const fs   = require("fs");

const OLI_BASE = "https://cloud.olisystems.com/api/v1";

// Cache the uploaded .dbs file ID for the session
let _dbsFileId = null;

// ── LIVE: Upload .dbs chemistry model file ────────────────────────────────────
async function uploadDbsFile(token) {
  if (_dbsFileId) return _dbsFileId;

  const dbsPath = process.env.OLI_DBS_PATH || "./oli/refinery.dbs";
  if (!fs.existsSync(dbsPath)) {
    throw new Error(`OLI .dbs file not found at ${dbsPath}. Set OLI_DBS_PATH in .env`);
  }

  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", fs.createReadStream(dbsPath));

  const res = await fetch(`${OLI_BASE}/flash/dbs`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() },
    body:    form,
  });

  if (!res.ok) throw new Error(`OLI .dbs upload failed: ${res.status}`);
  const data = await res.json();
  _dbsFileId = data.fileId || data.id;
  console.log(`  [OLI] .dbs uploaded → fileId: ${_dbsFileId}`);
  return _dbsFileId;
}

// ── LIVE: Run corrosion calculation ───────────────────────────────────────────
async function runLiveCalculation(unitName, model, liveData) {
  const token   = await getToken();
  const fileId  = await uploadDbsFile(token);
  const T       = liveData.temp     ?? model.conditions.temperature;
  const P       = liveData.pressure ?? model.conditions.pressure;

  // Build OLI Engine API request body
  // Reference: https://devdocs.olisystems.com/inflows-input
  const requestBody = {
    dbsFileId:  fileId,
    thermodynamicFramework: "MSE",
    calculations: [{
      unitSet: {
        temperature: "°C",
        pressure:    "bara",
        amount:      "mol/s",
      },
      inflows: Object.entries(model.inflows).reduce((acc, [species, spec]) => {
        acc[species] = { value: spec.value, unit: spec.unit };
        return acc;
      }, {}),
      temperature: { value: T, unit: "°C" },
      pressure:    { value: P, unit: "bara" },
      calculationType: "corrosion",
      corrosionParameters: {
        material:        model.material,
        geometry:        "pipe",
        velocity:        { value: 1.5, unit: "m/s" },
      },
    }],
  };

  const res = await fetch(`${OLI_BASE}/flash/corrosion`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OLI calculation failed for ${unitName}: ${res.status} ${errText}`);
  }

  const oliResult = await res.json();

  // ── Normalize OLI response to our internal shape ──
  // OLI returns results nested under calculations[0].results
  const r = oliResult.calculations?.[0]?.results || {};
  return {
    calculationId:    oliResult.calculationId || `OLI-${unitName}-${Date.now()}`,
    unitName,
    timestamp:        new Date().toISOString(),
    mode:             "live",
    oliVersion:       oliResult.engineVersion || "OLI Engine 11.x",
    conditions: {
      temperature: { value: T, unit: "°C" },
      pressure:    { value: P, unit: "bara" },
    },
    corrosionRate: {
      total: {
        value: r.corrosionRate?.value ?? 0,
        unit:  r.corrosionRate?.unit  ?? "mm/year",
      },
      // OLI returns mechanism breakdown under r.mechanismRates
      ...(r.mechanismRates || {}),
    },
    streamChemistry: {
      pH:              r.pH              || { value: 7.0, unit: "" },
      h2sConc:         r.h2sConc         || { value: 0,   unit: "mg/L" },
      co2PartialPress: r.co2PartialPress || { value: 0,   unit: "bar"  },
    },
    riskFlags:         r.riskFlags        || {},
    dominantMechanism: r.dominantMechanism || "unknown",
    unitSeverity:      r.severity         || "normal",
    monitorPoints:     model.monitorPoints, // Wall thickness still from our model
  };
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
/**
 * Calculate corrosion for a single unit.
 * Automatically routes to mock or live based on OLI_MOCK env var.
 *
 * @param {string} unitName   - e.g. "CDU-1"
 * @param {object} liveData   - optional { temp, pressure } from live SCADA
 * @returns {Promise<object>} - normalized corrosion result
 */
async function calculateCorrosion(unitName, liveData = {}) {
  const model = UNIT_MODELS[unitName];
  if (!model) throw new Error(`No corrosion model defined for unit: ${unitName}`);

  const isMock = process.env.OLI_MOCK !== "false";

  if (isMock) {
    // Simulate ~50ms API latency
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
    return runMockCalculation(unitName, model, liveData);
  }

  return runLiveCalculation(unitName, model, liveData);
}

/**
 * Calculate corrosion for all monitored units in parallel.
 * @param {object} liveUnitData - map of { unitName: { temp, pressure } }
 */
async function calculateAllUnits(liveUnitData = {}) {
  const unitNames = Object.keys(UNIT_MODELS);
  const results = await Promise.allSettled(
    unitNames.map(name => calculateCorrosion(name, liveUnitData[name] || {}))
  );
  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    console.error(`  [OLI] Calculation failed for ${unitNames[i]}:`, r.reason?.message);
    return { unitName: unitNames[i], error: r.reason?.message, unitSeverity: "unknown" };
  });
}

module.exports = { calculateCorrosion, calculateAllUnits };
