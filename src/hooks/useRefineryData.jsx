/**
 * useRefineryData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom React hook that polls the LA Refinery mock API and returns live data.
 *
 * Each endpoint has its own polling interval tuned to how fast that data
 * changes in a real refinery:
 *
 *   KPIs       → every 5s   (fast — operators watch these constantly)
 *   Throughput → every 10s  (rolling window, new point appended each tick)
 *   Units      → every 8s   (temp/pressure/load drift)
 *   Alerts     → every 6s   (threshold breaches surface quickly)
 *   Yield      → every 30s  (slow-moving, shift-level changes)
 *   Crude slate→ every 60s  (changes on tanker delivery schedule)
 *   Margins    → every 45s  (market data, slower)
 *   Production → every 60s  (monthly rollup, updates end of day)
 *
 * Usage in your component:
 *
 *   import useRefineryData from "../hooks/useRefineryData";
 *   const { kpis, units, alerts, throughput, loading, error } = useRefineryData();
 */

import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";

// ── POLLING INTERVALS (ms) ────────────────────────────────────────────────────
const INTERVALS = {
  kpis: 5_000,
  throughput: 10_000,
  units: 8_000,
  alerts: 6_000,
  yield: 30_000,
  crudeSlate: 60_000,
  margins: 45_000,
  production: 60_000,
  tankers: 15_000,
  corrosion: 90_000,
};

// ── INITIAL STATE (shown while first fetch is in flight) ──────────────────────
const INITIAL = {
  kpis: null,
  throughput: [],
  yield: [],
  units: [],
  alerts: [],
  crudeSlate: [],
  margins: [],
  production: [],
  tankers: [],
  corrosion: [],
};

// ── FETCH HELPER ──────────────────────────────────────────────────────────────
async function fetchEndpoint(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ── HOOK ──────────────────────────────────────────────────────────────────────
export default function useRefineryData() {
  const [data, setData] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timers = useRef({});

  // Generic poller: fetches one endpoint, merges result into state
  const poll = useCallback(async (key, path) => {
    try {
      const result = await fetchEndpoint(path);
      setData((prev) => ({ ...prev, [key]: result }));
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Bootstrap: fire all fetches once immediately, then set up intervals
  useEffect(() => {
    const endpoints = [
      ["kpis", "/kpis"],
      ["throughput", "/throughput"],
      ["yield", "/yield"],
      ["units", "/units"],
      ["alerts", "/alerts"],
      ["crudeSlate", "/crude-slate"],
      ["margins", "/margins"],
      ["production", "/production"],
      ["tankers", "/tankers"],
      ["corrosion", "/corrosion"],
    ];

    // Fire all fetches immediately (parallel)
    Promise.all(endpoints.map(([key, path]) => poll(key, path))).finally(() =>
      setLoading(false),
    );

    // Set up individual polling timers
    endpoints.forEach(([key, path]) => {
      timers.current[key] = setInterval(() => poll(key, path), INTERVALS[key]);
    });

    // Cleanup all timers on unmount
    return () => {
      Object.values(timers.current).forEach(clearInterval);
    };
  }, [poll]);

  // Delta helpers — compares current KPI value against previous to drive
  // the up/down arrow and color in the KPI cards
  const getDelta = useCallback(
    (key) => {
      if (!data.kpis) return { delta: null, deltaPos: true };
      const kpi = data.kpis[key];
      if (!kpi || kpi.prev == null) return { delta: null, deltaPos: true };
      const diff = kpi.value - kpi.prev;
      const pct = kpi.prev !== 0 ? ((diff / kpi.prev) * 100).toFixed(1) : "0.0";
      const isPos = diff >= 0;
      const sign = isPos ? "+" : "";
      // For crack spread, down is bad; for everything else up is good
      const deltaPos = key === "crackSpread" ? isPos : isPos;
      return {
        delta: `${sign}${pct}%`,
        deltaPos,
        rawDiff: diff,
      };
    },
    [data.kpis],
  );

  return {
    // Raw data
    kpis: data.kpis,
    throughput: data.throughput,
    yieldData: data.yield,
    units: data.units,
    alerts: data.alerts,
    crudeSlate: data.crudeSlate,
    margins: data.margins,
    production: data.production,
    tankers: data.tankers,
    corrosion: data.corrosion,

    // Meta
    loading,
    error,
    lastUpdated,
    getDelta,

    // Manual refresh (e.g. triggered by refresh button)
    refresh: () => {
      const endpoints = [
        ["kpis", "/kpis"],
        ["throughput", "/throughput"],
        ["yield", "/yield"],
        ["units", "/units"],
        ["alerts", "/alerts"],
        ["crudeSlate", "/crude-slate"],
        ["margins", "/margins"],
        ["production", "/production"],
        ["tankers", "/tankers"],
        ["corrosion", "/corrosion"],
      ];
      endpoints.forEach(([key, path]) => poll(key, path));
    },
  };
}
