/**
 * useProcessData.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WebSocket hook for real-time process data.
 * Connects to the same port as the REST API (no separate WS port).
 *
 * Receives { kpis, units, alerts } pushed from server every 2s.
 * Falls back to REST polling automatically if WS is unavailable.
 */

import { useState, useEffect, useRef, useCallback } from "react";

const API_URL      = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";
const RECONNECT_MS = 3000;
const FALLBACK_MS  = 5000;

// Derive WS URL from API_URL automatically (same host, ws:// scheme)
function getWsUrl() {
  try {
    const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";
    const u = new URL(apiUrl);
    return `${u.protocol === "https:" ? "wss" : "ws"}://${u.host}`;
  } catch {
    return "ws://localhost:3001";
  }
}

const WS_URL = getWsUrl();

export default function useProcessData() {
  const [data,       setData]       = useState({ kpis:null, units:[], alerts:[] });
  const [wsStatus,   setWsStatus]   = useState("connecting");
  const [lastTickTs, setLastTickTs] = useState(null);
  const [tickCount,  setTickCount]  = useState(0);

  const ws            = useRef(null);
  const reconnTimer   = useRef(null);
  const fallbackTimer = useRef(null);
  const mounted       = useRef(true);

  const applyTick = useCallback((payload) => {
    if (!mounted.current) return;
    setData(prev => ({
      kpis:   payload.kpis   ?? prev.kpis,
      units:  payload.units  ?? prev.units,
      alerts: payload.alerts ?? prev.alerts,
    }));
    setLastTickTs(payload.ts || new Date().toISOString());
    setTickCount(n => n + 1);
  }, []);

  const restFallback = useCallback(async () => {
    try {
      const [kR, uR, aR] = await Promise.all([
        fetch(`${API_URL}/kpis`),
        fetch(`${API_URL}/units`),
        fetch(`${API_URL}/alerts`),
      ]);
      const [kJ, uJ, aJ] = await Promise.all([kR.json(), uR.json(), aR.json()]);
      applyTick({ kpis:kJ.data, units:uJ.data, alerts:aJ.data, ts:new Date().toISOString() });
    } catch (e) {
      console.warn("[useProcessData] REST fallback failed:", e.message);
    }
  }, [applyTick]);

  const connect = useCallback(() => {
    if (!mounted.current) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        if (!mounted.current) return;
        setWsStatus("open");
        clearInterval(fallbackTimer.current);
        console.log(`[useProcessData] WS connected to ${WS_URL}`);
      };

      ws.current.onmessage = (event) => {
        if (!mounted.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "tick")  applyTick(msg.data);
          if (msg.type === "alert") setData(prev => ({
            ...prev,
            alerts: [msg.data, ...prev.alerts].slice(0, 8),
          }));
        } catch {}
      };

      ws.current.onclose = () => {
        if (!mounted.current) return;
        setWsStatus("closed");
        fallbackTimer.current = setInterval(restFallback, FALLBACK_MS);
        restFallback();
        reconnTimer.current = setTimeout(connect, RECONNECT_MS);
      };

      ws.current.onerror = () => {
        setWsStatus("fallback");
        ws.current?.close();
      };
    } catch {
      setWsStatus("fallback");
      fallbackTimer.current = setInterval(restFallback, FALLBACK_MS);
      restFallback();
    }
  }, [applyTick, restFallback]);

  useEffect(() => {
    mounted.current = true;
    connect();
    return () => {
      mounted.current = false;
      clearTimeout(reconnTimer.current);
      clearInterval(fallbackTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  const getDelta = useCallback((key) => {
    if (!data.kpis) return { delta:null, deltaPos:true };
    const kpi = data.kpis[key];
    if (!kpi || kpi.prev == null) return { delta:null, deltaPos:true };
    const diff = kpi.value - kpi.prev;
    const pct  = kpi.prev !== 0 ? ((diff / kpi.prev) * 100).toFixed(1) : "0.0";
    return { delta:`${diff >= 0 ? "+" : ""}${pct}%`, deltaPos:diff >= 0, rawDiff:diff };
  }, [data.kpis]);

  return { kpis:data.kpis, units:data.units, alerts:data.alerts,
           wsStatus, lastTickTs, tickCount, getDelta };
}
