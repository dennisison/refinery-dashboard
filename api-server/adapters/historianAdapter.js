/**
 * historianAdapter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic historian interface. Routes to the correct implementation based on
 * HISTORIAN_TYPE environment variable.
 *
 * Supported types:
 *   mock    — uses current server state (default)
 *   pi      — OSIsoft PI Web API
 *   phd     — Honeywell Uniformance PHD
 *   ip21    — AspenTech InfoPlus.21
 *   opcua   — OPC-UA direct (via node-opcua)
 *
 * All implementations expose the same interface:
 *   getCurrentValues(tags)          → { tagName: { value, unit, quality, ts } }
 *   getHistory(tags, range)         → { tagName: [{ value, ts }] }
 *   getInterpolated(tags, start, end, interval) → { tagName: [{ value, ts }] }
 *
 * TO SWITCH TO PI WEB API:
 *   Set in .env:  HISTORIAN_TYPE=pi
 *                 PI_SERVER=https://your-pi-server/piwebapi
 *                 PI_USERNAME=your-username
 *                 PI_PASSWORD=your-password
 *   Then fill in adapters/piWebApi.js with your tag paths.
 */

require("dotenv").config();

const HISTORIAN_TYPE = process.env.HISTORIAN_TYPE || "mock";

// ── Tag registry — maps friendly names to historian-specific paths ─────────────
// When connecting to a real historian, populate these with your actual tag names.
const TAG_REGISTRY = {
  // CDU-1
  "CDU1.FEED_RATE":     { pi: "\\\\SERVER\\CDU1.FEED_RATE",    phd: "CDU1_FEED_RATE",   ip21: "CDU1_FR",  mock: { base: 91,  unit: "%",    noise: 1.2 } },
  "CDU1.TEMP_FLASH":    { pi: "\\\\SERVER\\CDU1.TEMP_FLASH",   phd: "CDU1_TEMP_FLASH",  ip21: "CDU1_TF",  mock: { base: 369, unit: "°C",   noise: 2.5 } },
  "CDU1.PRESSURE":      { pi: "\\\\SERVER\\CDU1.PRESSURE",     phd: "CDU1_PRESS",       ip21: "CDU1_P",   mock: { base: 134, unit: "barg", noise: 1.5 } },
  // FCC-1
  "FCC1.REGEN_TEMP":    { pi: "\\\\SERVER\\FCC1.REGEN_TEMP",   phd: "FCC1_REGEN_TEMP",  ip21: "FCC1_RT",  mock: { base: 532, unit: "°C",   noise: 3.0 } },
  "FCC1.REACTOR_PRESS": { pi: "\\\\SERVER\\FCC1.REACTOR_PRESS",phd: "FCC1_RX_PRESS",    ip21: "FCC1_RP",  mock: { base: 30,  unit: "barg", noise: 0.5 } },
  // HCR-1
  "HCR1.H2_PRESS":      { pi: "\\\\SERVER\\HCR1.H2_PRESS",     phd: "HCR1_H2_PRESS",   ip21: "HCR1_H2",  mock: { base: 178, unit: "barg", noise: 2.0 } },
  // COGEN
  "COGEN.OUTPUT_MW":    { pi: "\\\\SERVER\\COGEN.OUTPUT_MW",   phd: "COGEN_MW",         ip21: "COGEN_MW", mock: { base: 348, unit: "MW",   noise: 4.0 } },
  // Crude throughput
  "REFINERY.CRUDE_TPT": { pi: "\\\\SERVER\\REFINERY.CRUDE_TPT",phd: "CRUDE_TPT",        ip21: "CRUDE_TPT",mock: { base: 361, unit: "MBPD", noise: 2.5 } },
};

// ── Mock implementation ───────────────────────────────────────────────────────
const mockHistorian = {
  async getCurrentValues(tags) {
    const result = {};
    for (const tag of tags) {
      const reg = TAG_REGISTRY[tag];
      if (!reg?.mock) {
        result[tag] = { value: null, unit: "", quality: "bad", ts: new Date().toISOString() };
        continue;
      }
      result[tag] = {
        value:   parseFloat((reg.mock.base + (Math.random() - 0.5) * 2 * reg.mock.noise).toFixed(2)),
        unit:    reg.mock.unit,
        quality: "good",
        ts:      new Date().toISOString(),
      };
    }
    return result;
  },

  async getHistory(tags, range) {
    const points = range === "1h" ? 60 : range === "24h" ? 144 : range === "7d" ? 168 : 24;
    const intervalMs = range === "1h" ? 60000 : range === "24h" ? 600000 : range === "7d" ? 3600000 : 3600000;
    const result = {};
    for (const tag of tags) {
      const reg = TAG_REGISTRY[tag];
      if (!reg?.mock) { result[tag] = []; continue; }
      let val = reg.mock.base;
      result[tag] = Array.from({ length: points }, (_, i) => {
        val = parseFloat((val + (Math.random() - 0.5) * reg.mock.noise).toFixed(2));
        return { value: val, ts: new Date(Date.now() - (points - i) * intervalMs).toISOString() };
      });
    }
    return result;
  },

  async getInterpolated(tags, start, end, intervalMs = 60000) {
    return this.getHistory(tags, "1h"); // stub
  },
};

// ── PI Web API implementation stub ────────────────────────────────────────────
// Fill in when PI Web API server details are available.
const piHistorian = {
  async getCurrentValues(tags) {
    const PI_SERVER  = process.env.PI_SERVER;
    const PI_CREDS   = Buffer.from(`${process.env.PI_USERNAME}:${process.env.PI_PASSWORD}`).toString("base64");
    const result = {};
    await Promise.all(tags.map(async (tag) => {
      const piPath = TAG_REGISTRY[tag]?.pi;
      if (!piPath) { result[tag] = { value: null, quality: "bad" }; return; }
      try {
        const res  = await fetch(`${PI_SERVER}/streams/${encodeURIComponent(piPath)}/value`, {
          headers: { Authorization: `Basic ${PI_CREDS}` },
        });
        const data = await res.json();
        result[tag] = {
          value:   data.Value,
          unit:    data.UnitsAbbreviation || "",
          quality: data.Good ? "good" : "bad",
          ts:      data.Timestamp,
        };
      } catch (err) {
        result[tag] = { value: null, quality: "error", error: err.message };
      }
    }));
    return result;
  },

  async getHistory(tags, range) {
    const PI_SERVER = process.env.PI_SERVER;
    const PI_CREDS  = Buffer.from(`${process.env.PI_USERNAME}:${process.env.PI_PASSWORD}`).toString("base64");
    const endTime   = new Date().toISOString();
    const startTime = range === "1h"  ? new Date(Date.now() - 3600000).toISOString()
                    : range === "24h" ? new Date(Date.now() - 86400000).toISOString()
                    : new Date(Date.now() - 7 * 86400000).toISOString();
    const result = {};
    await Promise.all(tags.map(async (tag) => {
      const piPath = TAG_REGISTRY[tag]?.pi;
      if (!piPath) { result[tag] = []; return; }
      try {
        const res  = await fetch(
          `${PI_SERVER}/streams/${encodeURIComponent(piPath)}/interpolated?startTime=${startTime}&endTime=${endTime}&interval=1h`,
          { headers: { Authorization: `Basic ${PI_CREDS}` } }
        );
        const data = await res.json();
        result[tag] = (data.Items || []).map(p => ({ value: p.Value, ts: p.Timestamp }));
      } catch (err) {
        result[tag] = [];
      }
    }));
    return result;
  },

  async getInterpolated(tags, start, end, intervalMs) {
    return this.getHistory(tags, "1h"); // stub
  },
};

// ── Route to correct implementation ──────────────────────────────────────────
const ADAPTERS = {
  mock:  mockHistorian,
  pi:    piHistorian,
  phd:   mockHistorian, // stub — replace with PHD REST client
  ip21:  mockHistorian, // stub — replace with IP21 REST client
  opcua: mockHistorian, // stub — replace with node-opcua subscription
};

const adapter = ADAPTERS[HISTORIAN_TYPE] || mockHistorian;

if (HISTORIAN_TYPE !== "mock") {
  console.log(`  [Historian] Using ${HISTORIAN_TYPE.toUpperCase()} adapter`);
} else {
  console.log("  [Historian] Using mock adapter (set HISTORIAN_TYPE in .env to switch)");
}

module.exports = adapter;
module.exports.TAG_REGISTRY = TAG_REGISTRY;
module.exports.HISTORIAN_TYPE = HISTORIAN_TYPE;
