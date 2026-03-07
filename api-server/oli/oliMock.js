/**
 * oliMock.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Physically realistic mock of the OLI Engine API corrosion calculation.
 *
 * Returns the same JSON shape as a real OLI Engine API /flash/corrosion
 * response so that swapping in the live client requires zero changes to
 * downstream code — only oliClient.js changes.
 *
 * Corrosion rate models used (simplified empirical):
 *
 *   H2S / Sulfidic:      McConomy curves (API 939-C)
 *     rate = base_rate × f(T) × f(H2S_conc) × f(alloy)
 *
 *   Naphthenic acid:     Couper-Gorman (API 581)
 *     rate = k × TAN × velocity_factor × f(T) (onset > 220°C)
 *
 *   CO2 / Sweet:         de Waard-Milliams model
 *     rate = 0.0646 × 10^(1620/(T+273) × pCO2^0.36
 *
 *   HCl overhead:        empirical, strong function of pH and water dew point
 *
 *   H2SO4:               Couper curves for carbon steel
 *
 *   HTHA:                API 941 Nelson curves (flag only, not rate)
 *
 * All rates in mm/year.
 */

const { getPointStatus, remainingLifeYears } = require("./corrosionModels");

// ── EMPIRICAL RATE FUNCTIONS ───────────────────────────────────────────────────

// McConomy H2S/Sulfidic corrosion rate (mm/yr) — CS baseline
function sulfidic_rate(tempC, h2s_mol_s) {
  if (tempC < 260) return 0;
  // Exponential onset above 260°C, doubles every ~55°C
  const temp_factor = Math.exp((tempC - 260) / 55);
  const conc_factor = Math.pow(h2s_mol_s, 0.5);
  return parseFloat((0.025 * temp_factor * conc_factor).toFixed(4));
}

// Naphthenic acid corrosion (mm/yr) — onset > 220°C, peaks ~370°C
function naphthenic_rate(tempC, tan_mg_kg, velocity = 1.0) {
  if (tempC < 220 || !tan_mg_kg || tan_mg_kg < 0.1) return 0;
  const temp_factor = Math.exp((tempC - 220) / 60);
  return parseFloat((0.018 * tan_mg_kg * temp_factor * velocity).toFixed(4));
}

// CO2 / Sweet corrosion (mm/yr) — de Waard-Milliams simplified
function co2_rate(tempC, pco2_bar) {
  if (!pco2_bar || pco2_bar < 0.001) return 0;
  const log_rate = 1620 / (tempC + 273) - 5.04 + 0.67 * Math.log10(pco2_bar * 100);
  return parseFloat(Math.max(0, Math.pow(10, log_rate)).toFixed(4));
}

// HCl overhead corrosion (mm/yr) — empirical, strong pH dependence
function hcl_rate(tempC, hcl_mol_s) {
  if (!hcl_mol_s || hcl_mol_s < 0.001) return 0;
  // Only active near water dew point in overhead (typically 100-150°C)
  if (tempC > 180 || tempC < 80) return 0;
  return parseFloat((0.15 * Math.pow(hcl_mol_s, 0.8)).toFixed(4));
}

// H2SO4 corrosion (mm/yr) — Couper curve, minimum near 98% strength
function h2so4_rate(tempC, strength_pct) {
  if (!strength_pct) return 0;
  // Minimum at ~98% (anhydrous), rises sharply below 90% (dilute)
  const dilution_factor = strength_pct < 90
    ? Math.exp((90 - strength_pct) / 8)
    : Math.exp((98 - strength_pct) / 40);
  const temp_factor = 1 + Math.max(0, (tempC - 10) / 30);
  return parseFloat((0.04 * dilution_factor * temp_factor).toFixed(4));
}

// NH4HS under-deposit / flow-accelerated (mm/yr)
function nh4hs_rate(nh4hs_mol_s, velocity = 1.0) {
  if (!nh4hs_mol_s) return 0;
  return parseFloat((0.08 * nh4hs_mol_s * velocity).toFixed(4));
}

// HTHA check — API 941 Nelson curve flag (boolean)
function htha_risk(tempC, h2_partial_pressure_bar) {
  // CS limit approx: 260°C at any H2 partial pressure
  // 1.25Cr: limit approx 340°C at 70 bar H2
  // 2.25Cr: limit approx 425°C at 200 bar H2
  if (tempC > 260 && h2_partial_pressure_bar > 5)   return "elevated";
  if (tempC > 320 && h2_partial_pressure_bar > 50)  return "high";
  return "low";
}

// ── SMALL NOISE for simulation realism ────────────────────────────────────────
function noise(base, pct = 0.06) {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

// ── MAIN MOCK CALCULATION ─────────────────────────────────────────────────────
/**
 * Runs mock OLI corrosion calculation for a single unit.
 * @param {string} unitName  - e.g. "CDU-1"
 * @param {object} model     - from UNIT_MODELS[unitName]
 * @param {object} liveData  - optional: { temp, pressure } from live unit state
 * @returns {object}         - OLI-shaped response
 */
function runMockCalculation(unitName, model, liveData = {}) {
  const T   = liveData.temp     ?? model.conditions.temperature;
  const P   = liveData.pressure ?? model.conditions.pressure;
  const inf = model.inflows;

  // ── Compute individual mechanism rates ──
  const h2s_conc   = inf.H2S?.value    ?? 0;
  const tan        = inf.NaphthenicAcid?.value ?? 0;
  const co2_conc   = inf.CO2?.value    ?? 0;
  const hcl_conc   = inf.HCl?.value    ?? 0;
  const h2so4_str  = inf.AcidStrength?.value ?? 98;
  const nh4hs_conc = inf.NH4HS?.value  ?? 0;
  const h2_conc    = inf.H2?.value     ?? 0;

  const rates = {
    sulfidic:       noise(sulfidic_rate(T, h2s_conc)),
    naphthenic:     noise(naphthenic_rate(T, tan)),
    co2:            noise(co2_rate(T, co2_conc * P / 10)),
    hcl:            noise(hcl_rate(T, hcl_conc)),
    h2so4:          noise(h2so4_rate(T, h2so4_str)),
    nh4hs:          noise(nh4hs_rate(nh4hs_conc)),
  };

  // Total corrosion rate — dominant mechanism wins, others add 10-20%
  const dominantRate = Math.max(...Object.values(rates));
  const otherRates   = Object.values(rates).filter(r => r !== dominantRate);
  const totalRate    = parseFloat((
    dominantRate + otherRates.reduce((s, r) => s + r * 0.15, 0)
  ).toFixed(4));

  // Dominant mechanism label
  const dominantMechanism = Object.entries(rates)
    .sort(([,a],[,b]) => b - a)[0][0];

  // pH estimate (simplified)
  const pH = h2so4_str < 95
    ? parseFloat((0.5 + (h2so4_str - 88) / 20).toFixed(2))
    : parseFloat((4.5 - Math.log10(hcl_conc + 0.001) * 0.8).toFixed(2));

  // HTHA risk
  const htha = htha_risk(T, h2_conc * P);

  // Monitor points — apply rate to get updated thickness and remaining life
  const monitorPoints = model.monitorPoints.map(pt => {
    // Small per-point rate variation (geometry, flow velocity differences)
    const ptRate = parseFloat((totalRate * (0.8 + Math.random() * 0.5)).toFixed(4));
    const newThickness = parseFloat(
      Math.max(0, pt.currentMM - ptRate * (1 / 8760) * 300).toFixed(2)
    ); // simulate ~300hr elapsed
    const status = getPointStatus({ ...pt, currentMM: newThickness });
    const remaining = remainingLifeYears({ ...pt, currentMM: newThickness }, ptRate);
    return {
      ...pt,
      currentMM:         newThickness,
      corrosionRateMmYr: ptRate,
      wallLossPct:       parseFloat(((1 - newThickness / pt.nominalMM) * 100).toFixed(1)),
      remainingLifeYrs:  remaining,
      status,
      nextInspection:    remaining && remaining < 2 ? "Immediate" :
                         remaining && remaining < 4 ? "6 months"  :
                         remaining && remaining < 8 ? "12 months" : "24 months",
    };
  });

  // Overall unit severity
  const hasAny = (s) => monitorPoints.some(p => p.status === s);
  const unitSeverity = hasAny("critical") ? "critical"
    : hasAny("warning")  ? "warning"
    : totalRate > 0.5    ? "elevated"
    : "normal";

  // ── OLI Engine API response shape ──
  return {
    // Metadata
    calculationId:   `MOCK-${unitName}-${Date.now()}`,
    unitName,
    timestamp:        new Date().toISOString(),
    mode:            "mock",
    oliVersion:      "OLI Engine 11.x (mock)",

    // Operating conditions (echoed back)
    conditions: {
      temperature: { value: T, unit: "°C" },
      pressure:    { value: P, unit: "bara" },
    },

    // Core corrosion result
    corrosionRate: {
      total:      { value: totalRate,      unit: "mm/year" },
      sulfidic:   { value: parseFloat(rates.sulfidic.toFixed(4)),   unit: "mm/year" },
      naphthenic: { value: parseFloat(rates.naphthenic.toFixed(4)), unit: "mm/year" },
      co2:        { value: parseFloat(rates.co2.toFixed(4)),        unit: "mm/year" },
      hcl:        { value: parseFloat(rates.hcl.toFixed(4)),        unit: "mm/year" },
      h2so4:      { value: parseFloat(rates.h2so4.toFixed(4)),      unit: "mm/year" },
      nh4hs:      { value: parseFloat(rates.nh4hs.toFixed(4)),      unit: "mm/year" },
    },

    // Stream chemistry
    streamChemistry: {
      pH:              { value: pH, unit: "" },
      h2sConc:         { value: parseFloat((h2s_conc * 34 * 1000).toFixed(1)), unit: "mg/L" },
      co2PartialPress: { value: parseFloat((co2_conc * P / 10).toFixed(3)),    unit: "bar"  },
    },

    // Risk flags
    riskFlags: {
      hthaRisk:           htha,
      polythionicAcidSCC: unitName === "FCC-1",
      stressCorrCracking: unitName === "HCR-1",
      thermalFatigue:     unitName.startsWith("DCK"),
    },

    // Summary
    dominantMechanism,
    unitSeverity,

    // Monitor points
    monitorPoints,
  };
}

module.exports = { runMockCalculation };
