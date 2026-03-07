/**
 * LA Refinery API Server v2.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Single process, single port. No Redis. Deploy anywhere for free.
 *
 * HTTP:  http://localhost:3001/api   (REST endpoints)
 * WS:    ws://localhost:3001         (WebSocket, same port via upgrade)
 *
 * Install:  npm install
 * Run:      node server.js
 *
 * Environment variables (.env):
 *   PORT=3001           HTTP + WS port
 *   OLI_MOCK=true       Use mock OLI calculations (default)
 *   OLI_USERNAME=       OLI Cloud credentials (when OLI_MOCK=false)
 *   OLI_PASSWORD=
 *   OLI_DBS_PATH=       Path to .dbs chemistry model file
 *   HISTORIAN_TYPE=mock mock | pi | phd | ip21 | opcua
 *
 * Architecture:
 *   - tickState() runs on a 2s WS interval, NOT on REST requests
 *   - REST routes are pure reads of shared state (no side effects)
 *   - WebSocket pushes kpis + units + alerts to all clients every 2s
 *   - OLI corrosion runs inline with a 60s in-memory cache (no Redis needed)
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app); // single server for HTTP + WS

app.use(cors());
app.use(express.json());

// ── DRIFT UTILITIES ───────────────────────────────────────────────────────────
function drift(current, maxDelta, min, max, decimals = 1) {
  const next = current + (Math.random() - 0.5) * 2 * maxDelta;
  return parseFloat(Math.min(max, Math.max(min, next)).toFixed(decimals));
}

function driftWithSpike(
  current,
  maxDelta,
  min,
  max,
  spikeMult = 3,
  spikeChance = 0.04,
  decimals = 1,
) {
  return drift(
    current,
    maxDelta * (Math.random() < spikeChance ? spikeMult : 1),
    min,
    max,
    decimals,
  );
}

// ── SHARED STATE ──────────────────────────────────────────────────────────────
const state = {
  kpis: {
    crudeThroughput: 361,
    carbGasoline: 176,
    carbDiesel: 110,
    jetFuel: 45,
    cogenOutput: 348,
    crackSpread: 18.7,
    crudeThroughputPrev: 343,
    carbGasPrev: 174,
    carbDieselPrev: 109,
    jetFuelPrev: 45.2,
    cogenPrev: 341,
    crackSpreadPrev: 19.2,
  },
  throughput: Array.from({ length: 12 }, (_, i) => {
    const h = (i * 2).toString().padStart(2, "0");
    const base = 320 + Math.random() * 40;
    return {
      time: `${h}:00`,
      crude: parseFloat(base.toFixed(1)),
      carbGas: parseFloat((base * 0.487).toFixed(1)),
      carbDiesel: parseFloat((base * 0.305).toFixed(1)),
      jet: parseFloat((base * 0.125).toFixed(1)),
      coke: parseFloat((base * 0.063).toFixed(1)),
    };
  }),
  yield: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    carbGas: parseFloat((48.5 + (Math.random() - 0.5) * 2).toFixed(1)),
    carbDiesel: parseFloat((29.0 + (Math.random() - 0.5) * 1.5).toFixed(1)),
    jet: parseFloat((12.0 + (Math.random() - 0.5) * 1).toFixed(1)),
    fuelCoke: parseFloat((4.8 + (Math.random() - 0.5) * 0.6).toFixed(1)),
    anodeCoke: parseFloat((1.4 + (Math.random() - 0.5) * 0.3).toFixed(1)),
    other: parseFloat((3.5 + (Math.random() - 0.5) * 0.5).toFixed(1)),
  })),
  units: [
    {
      name: "CDU-1",
      load: 91,
      temp: 369,
      pressure: 134,
      status: "optimal",
      site: "NORTH",
      product: "Crude Distillation Unit",
      design: "~180 MBPD",
    },
    {
      name: "CDU-2",
      load: 88,
      temp: 371,
      pressure: 137,
      status: "optimal",
      site: "NORTH",
      product: "Crude Distillation Unit",
      design: "~120 MBPD",
    },
    {
      name: "VDU-1",
      load: 86,
      temp: 409,
      pressure: 16,
      status: "optimal",
      site: "NORTH",
      product: "Vacuum Distillation Unit",
      design: "~140 MBPD",
    },
    {
      name: "FCC-1",
      load: 93,
      temp: 532,
      pressure: 30,
      status: "warning",
      site: "SOUTH",
      product: "Fluid Catalytic Cracker",
      design: "~55 MBPD",
    },
    {
      name: "HCR-1",
      load: 89,
      temp: 398,
      pressure: 178,
      status: "optimal",
      site: "SOUTH",
      product: "Hydrocracker",
      design: "~45 MBPD",
    },
    {
      name: "DCK-1",
      load: 82,
      temp: 491,
      pressure: 46,
      status: "optimal",
      site: "SOUTH",
      product: "Delayed Coker (Fuel Grade)",
      design: "~35 MBPD",
    },
    {
      name: "DCK-2",
      load: 78,
      temp: 487,
      pressure: 44,
      status: "optimal",
      site: "SOUTH",
      product: "Delayed Coker (Anode Grade)",
      design: "~25 MBPD",
    },
    {
      name: "RFM-1",
      load: 95,
      temp: 508,
      pressure: 26,
      status: "optimal",
      site: "SOUTH",
      product: "Catalytic Reformer (CARB)",
      design: "~30 MBPD",
    },
    {
      name: "ALK-1",
      load: 74,
      temp: 15,
      pressure: 88,
      status: "optimal",
      site: "SOUTH",
      product: "Alkylation Unit (H2SO4)",
      design: "~15 MBPD",
    },
    {
      name: "HDS-1",
      load: 0,
      temp: 28,
      pressure: 0,
      status: "offline",
      site: "SOUTH",
      product: "Naphtha Hydrotreater - Turnaround",
      design: "Maint.",
    },
    {
      name: "COGEN",
      load: 87,
      temp: 618,
      pressure: 22,
      status: "optimal",
      site: "NORTH",
      product: "On-Site Cogeneration Plant",
      design: "400 MW",
    },
  ],
  alerts: [
    {
      id: 1,
      unit: "FCC-1",
      msg: "Cat cracker regen temp 532C - monitoring, limit 545C",
      level: "warn",
      ts: Date.now() - 480000,
    },
    {
      id: 2,
      unit: "HDS-1",
      msg: "Naphtha hydrotreater planned turnaround - Day 4 of 18",
      level: "info",
      ts: Date.now() - 345600000,
    },
    {
      id: 3,
      unit: "MARINE",
      msg: "ANS tanker ETA Port of Long Beach: 09:40",
      level: "info",
      ts: Date.now() - 7200000,
    },
    {
      id: 4,
      unit: "COGEN",
      msg: "Cogen output optimized - 348 MW, grid export active",
      level: "good",
      ts: Date.now() - 3600000,
    },
    {
      id: 5,
      unit: "CARB",
      msg: "CARB gasoline RON 91.4 - Phase 3 spec confirmed",
      level: "good",
      ts: Date.now() - 10800000,
    },
  ],
  nextAlertId: 6,
  crudeSlate: [
    { name: "CA San Joaquin Valley (heavy)", pct: 28, color: "#1a538a" },
    { name: "Alaska North Slope (ANS)", pct: 24, color: "#1a4e8a" },
    { name: "LA Basin California", pct: 12, color: "#2a7a50" },
    { name: "South America (Colombia/Brazil)", pct: 18, color: "#0a6e8a" },
    { name: "West Africa (Nigeria/Angola)", pct: 11, color: "#6040a0" },
    { name: "Other Waterborne", pct: 7, color: "#9c6010" },
  ],
  margins: [
    { mo: "Aug", spread: 24.8 },
    { mo: "Sep", spread: 21.4 },
    { mo: "Oct", spread: 19.6 },
    { mo: "Nov", spread: 16.2 },
    { mo: "Dec", spread: 14.1 },
    { mo: "Jan", spread: 17.8 },
    { mo: "Feb", spread: 19.2 },
    { mo: "Mar", spread: 18.7 },
  ],
  production: [
    { month: "Aug'24", target: 365, actual: 316 },
    { month: "Sep'24", target: 365, actual: 328 },
    { month: "Oct'24", target: 365, actual: 341 },
    { month: "Nov'24", target: 365, actual: 322 },
    { month: "Dec'24", target: 365, actual: 308 },
    { month: "Jan'25", target: 365, actual: 334 },
    { month: "Feb'25", target: 365, actual: 345 },
    { month: "Mar'25", target: 365, actual: 361 },
  ],
  tankers: [
    {
      vessel: "Polar Discovery",
      origin: "Alaska (ANS)",
      eta: "Today 09:40",
      bbl: 650000,
      api: 31.5,
      sulfur: 1.05,
      status: "inbound",
    },
    {
      vessel: "Pacific Mariner",
      origin: "Colombia (Vasconia)",
      eta: "Today 14:20",
      bbl: 500000,
      api: 24.1,
      sulfur: 1.72,
      status: "inbound",
    },
    {
      vessel: "Gulf Sovereign",
      origin: "Nigeria (Bonny Light)",
      eta: "Tomorrow 06:00",
      bbl: 700000,
      api: 35.4,
      sulfur: 0.14,
      status: "scheduled",
    },
    {
      vessel: "Long Beach Star",
      origin: "Ecuador (Oriente)",
      eta: "Tomorrow 18:45",
      bbl: 450000,
      api: 29.2,
      sulfur: 1.61,
      status: "scheduled",
    },
    {
      vessel: "Pacific Endeavour",
      origin: "Brazil (Marlim)",
      eta: "Mar 9 08:00",
      bbl: 550000,
      api: 19.8,
      sulfur: 0.77,
      status: "scheduled",
    },
    {
      vessel: "ANS Pioneer",
      origin: "Alaska (ANS)",
      eta: "Mar 11 12:30",
      bbl: 700000,
      api: 31.5,
      sulfur: 1.05,
      status: "scheduled",
    },
  ],
};

// ── THRESHOLD ALERTS ──────────────────────────────────────────────────────────
const THRESHOLDS = {
  "FCC-1": { tempWarn: 538, tempCrit: 545, loadWarn: 96 },
  "CDU-1": { tempWarn: 380, loadWarn: 97 },
  "CDU-2": { tempWarn: 380, loadWarn: 97 },
  "HCR-1": { pressureWarn: 185 },
  "RFM-1": { tempWarn: 515, loadWarn: 98 },
  COGEN: { loadWarn: 96 },
};

function checkThresholds(units, alerts, nextId) {
  let id = nextId;
  const out = [...alerts];
  units.forEach((u) => {
    const r = THRESHOLDS[u.name];
    if (!r) return;
    if (r.tempCrit && u.temp >= r.tempCrit) {
      out.unshift({
        id: id++,
        unit: u.name,
        level: "warn",
        ts: Date.now(),
        msg: `CRITICAL: ${u.name} temp ${u.temp}C exceeded limit ${r.tempCrit}C`,
      });
    } else if (r.tempWarn && u.temp >= r.tempWarn) {
      if (
        !out.find(
          (a) =>
            a.unit === u.name &&
            a.msg.includes("temp") &&
            Date.now() - a.ts < 300000,
        )
      )
        out.unshift({
          id: id++,
          unit: u.name,
          level: "warn",
          ts: Date.now(),
          msg: `${u.name} temp ${u.temp}C approaching limit`,
        });
    }
    if (r.loadWarn && u.load >= r.loadWarn) {
      if (
        !out.find(
          (a) =>
            a.unit === u.name &&
            a.msg.includes("load") &&
            Date.now() - a.ts < 300000,
        )
      )
        out.unshift({
          id: id++,
          unit: u.name,
          level: "warn",
          ts: Date.now(),
          msg: `${u.name} at ${u.load}% load - approaching max`,
        });
    }
    if (r.pressureWarn && u.pressure >= r.pressureWarn) {
      if (
        !out.find(
          (a) =>
            a.unit === u.name &&
            a.msg.includes("pressure") &&
            Date.now() - a.ts < 300000,
        )
      )
        out.unshift({
          id: id++,
          unit: u.name,
          level: "warn",
          ts: Date.now(),
          msg: `${u.name} pressure ${u.pressure} barg - above normal`,
        });
    }
  });
  return {
    alerts: out
      .filter((a) => a.level === "info" || Date.now() - a.ts < 1800000)
      .slice(0, 8),
    nextId: id,
  };
}

// ── TICK — called by WS loop every 2s, never by REST routes ──────────────────
function tickState() {
  const k = state.kpis;
  k.crudeThroughputPrev = k.crudeThroughput;
  k.carbGasPrev = k.carbGasoline;
  k.carbDieselPrev = k.carbDiesel;
  k.jetFuelPrev = k.jetFuel;
  k.cogenPrev = k.cogenOutput;
  k.crackSpreadPrev = k.crackSpread;

  k.crudeThroughput = driftWithSpike(k.crudeThroughput, 2.5, 290, 365, 3, 0.03);
  k.carbGasoline = parseFloat((k.crudeThroughput * 0.487).toFixed(1));
  k.carbDiesel = parseFloat((k.crudeThroughput * 0.305).toFixed(1));
  k.jetFuel = driftWithSpike(k.jetFuel, 0.6, 38, 50, 2, 0.03);
  k.cogenOutput = driftWithSpike(k.cogenOutput, 4, 300, 400, 2, 0.04);
  k.crackSpread = driftWithSpike(k.crackSpread, 0.4, 10, 32, 2, 0.03, 2);

  const now = new Date();
  state.throughput.shift();
  state.throughput.push({
    time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
    crude: k.crudeThroughput,
    carbGas: parseFloat((k.crudeThroughput * 0.487).toFixed(1)),
    carbDiesel: parseFloat((k.crudeThroughput * 0.305).toFixed(1)),
    jet: k.jetFuel,
    coke: parseFloat((k.crudeThroughput * 0.063).toFixed(1)),
  });

  state.units = state.units.map((u) => {
    if (u.status === "offline") return u;
    const load = driftWithSpike(u.load, 1.2, 60, 99, 3, 0.03, 0);
    const temp = driftWithSpike(
      u.temp,
      2.5,
      u.temp * 0.92,
      u.temp * 1.08,
      3,
      0.03,
      1,
    );
    const pressure =
      u.pressure > 0
        ? driftWithSpike(
            u.pressure,
            1.5,
            u.pressure * 0.93,
            u.pressure * 1.07,
            2,
            0.03,
            1,
          )
        : 0;
    const status =
      (u.name === "FCC-1" && temp >= 540) || load >= 96 ? "warning" : "optimal";
    return { ...u, load, temp, pressure, status };
  });

  const { alerts, nextId } = checkThresholds(
    state.units,
    state.alerts,
    state.nextAlertId,
  );
  state.alerts = alerts;
  state.nextAlertId = nextId;

  state.yield = state.yield.map((r) => ({
    ...r,
    carbGas: drift(r.carbGas, 0.3, 46, 52),
    carbDiesel: drift(r.carbDiesel, 0.2, 27, 32),
    jet: drift(r.jet, 0.15, 10, 14),
    fuelCoke: drift(r.fuelCoke, 0.1, 4, 6),
    anodeCoke: drift(r.anodeCoke, 0.05, 1, 2),
    other: drift(r.other, 0.1, 2.5, 4.5),
  }));

  const last = state.production[state.production.length - 1];
  last.actual = drift(last.actual, 1, 300, 365);
  const lastM = state.margins[state.margins.length - 1];
  lastM.spread = drift(lastM.spread, 0.3, 10, 32, 2);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const withMeta = (data) => ({ ok: true, ts: new Date().toISOString(), data });

function relativeTime(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

// ── REST ROUTES — pure reads, no tickState() ──────────────────────────────────
app.get("/api/kpis", (_, res) => {
  const k = state.kpis;
  res.json(
    withMeta({
      crudeThroughput: {
        value: k.crudeThroughput,
        unit: "MBPD",
        prev: k.crudeThroughputPrev,
        design: 365,
      },
      carbGasoline: {
        value: k.carbGasoline,
        unit: "MBPD",
        prev: k.carbGasPrev,
        sub: "RON 91.4 - Phase 3",
      },
      carbDiesel: {
        value: k.carbDiesel,
        unit: "MBPD",
        prev: k.carbDieselPrev,
        sub: "15 ppm S - ULSD",
      },
      jetFuel: {
        value: k.jetFuel,
        unit: "MBPD",
        prev: k.jetFuelPrev,
        sub: "Direct LAX pipeline",
      },
      cogenOutput: {
        value: k.cogenOutput,
        unit: "MW",
        prev: k.cogenPrev,
        sub: "400 MW nameplate",
      },
      crackSpread: {
        value: k.crackSpread,
        unit: "$/bbl",
        prev: k.crackSpreadPrev,
        sub: "West Coast realized",
      },
    }),
  );
});

app.get("/api/throughput", (_, res) => res.json(withMeta(state.throughput)));
app.get("/api/yield", (_, res) => res.json(withMeta(state.yield)));
app.get("/api/units", (_, res) => res.json(withMeta(state.units)));
app.get("/api/alerts", (_, res) =>
  res.json(
    withMeta(state.alerts.map((a) => ({ ...a, time: relativeTime(a.ts) }))),
  ),
);
app.get("/api/crude-slate", (_, res) => res.json(withMeta(state.crudeSlate)));
app.get("/api/margins", (_, res) => res.json(withMeta(state.margins)));
app.get("/api/production", (_, res) => res.json(withMeta(state.production)));
app.get("/api/tankers", (_, res) => res.json(withMeta(state.tankers)));

// ── HISTORIAN ROUTES (generic — swap adapter via HISTORIAN_TYPE env var) ──────
const historian = require("./adapters/historianAdapter");

app.get("/api/historian/current", async (req, res) => {
  const tags = req.query.tags
    ? req.query.tags.split(",")
    : Object.keys(historian.TAG_REGISTRY);
  try {
    res.json(
      withMeta({
        type: historian.HISTORIAN_TYPE,
        values: await historian.getCurrentValues(tags),
      }),
    );
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/historian/history", async (req, res) => {
  const tags = req.query.tags ? req.query.tags.split(",") : [];
  const range = req.query.range || "1h";
  if (!tags.length)
    return res.status(400).json({ ok: false, error: "?tags= required" });
  try {
    res.json(withMeta({ values: await historian.getHistory(tags, range) }));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── OLI CORROSION (inline async with in-memory cache) ────────────────────────
const { calculateCorrosion, calculateAllUnits } = require("./oli/oliClient");
let _corrosionCache = {};
let _corrosionLastCalc = 0;
const CORROSION_TTL_MS = 60_000;

async function refreshCorrosionCache() {
  const liveMap = {};
  state.units
    .filter((u) => u.status !== "offline")
    .forEach((u) => {
      liveMap[u.name] = { temp: u.temp, pressure: u.pressure };
    });
  const results = await calculateAllUnits(liveMap);
  results.forEach((r) => {
    if (r.unitName) _corrosionCache[r.unitName] = r;
  });
  _corrosionLastCalc = Date.now();
  console.log(`  [OLI] Cache refreshed — ${results.length} units`);
}

app.get("/api/corrosion", async (_, res) => {
  try {
    if (
      Date.now() - _corrosionLastCalc > CORROSION_TTL_MS ||
      !Object.keys(_corrosionCache).length
    )
      await refreshCorrosionCache();
    const summary = Object.values(_corrosionCache).map((r) => ({
      unitName: r.unitName,
      unitSeverity: r.unitSeverity,
      totalRateMmYr: r.corrosionRate?.total?.value ?? null,
      dominantMechanism: r.dominantMechanism,
      timestamp: r.timestamp,
      mode: r.mode,
      worstPoint: r.monitorPoints
        ? [...r.monitorPoints].sort(
            (a, b) => (a.remainingLifeYrs ?? 99) - (b.remainingLifeYrs ?? 99),
          )[0]
        : null,
    }));
    res.json(withMeta(summary));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/corrosion/:unit", async (req, res) => {
  const unitName = req.params.unit.toUpperCase();
  try {
    const liveUnit = state.units.find((u) => u.name === unitName);
    const result = await calculateCorrosion(
      unitName,
      liveUnit ? { temp: liveUnit.temp, pressure: liveUnit.pressure } : {},
    );
    _corrosionCache[unitName] = result;
    res.json(withMeta(result));
  } catch (e) {
    res
      .status(e.message.includes("No corrosion model") ? 404 : 500)
      .json({ ok: false, error: e.message });
  }
});

app.post("/api/corrosion/refresh", async (_, res) => {
  try {
    await refreshCorrosionCache();
    res.json(withMeta({ refreshed: Object.keys(_corrosionCache).length }));
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => {
  const { getClientCount } = require("./ws/wsServer");
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    uptime: process.uptime(),
    wsClients: getClientCount(),
    historian: historian.HISTORIAN_TYPE,
  });
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 3001;

// Attach WebSocket to the same HTTP server (same port — works on Render/Railway/Fly)
const { initWsServer } = require("./ws/wsServer");
initWsServer(server, state, tickState, relativeTime);

server.listen(PORT, () => {
  console.log(`\n  +------------------------------------------------+`);
  console.log(`  |  LA Refinery API v2.1 — single port, no Redis  |`);
  console.log(`  |  HTTP  -> http://localhost:${PORT}/api             |`);
  console.log(`  |  WS    -> ws://localhost:${PORT}                   |`);
  console.log(`  +------------------------------------------------+\n`);
});

// Warm OLI cache after 2s
setTimeout(refreshCorrosionCache, 2000);
