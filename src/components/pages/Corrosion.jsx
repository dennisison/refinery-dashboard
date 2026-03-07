/**
 * Corrosion.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * OLI Systems-powered corrosion monitoring page.
 * Tabs per unit: Overview | Mechanism Rates | Wall Thickness | Risk Flags
 *
 * Data flows: API /corrosion (all units) → summary cards
 *             API /corrosion/:unit       → detailed view on drill-down
 * In mock mode the API uses oliMock.js; in live mode it calls OLI Cloud.
 */

import { useState, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine
} from "recharts";
import {
  ShieldAlert, ArrowLeft, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Activity, Thermometer, Gauge,
  ChevronRight, Clock, Info
} from "lucide-react";
import { makeTooltip, tickStyle, Skeleton } from "../shared/Theme";

const BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";

// ── SEVERITY COLORS ───────────────────────────────────────────────────────────
const severityColor = (sev, t) => ({
  critical: t.bad,
  warning:  t.warn,
  elevated: t.amber,
  normal:   t.good,
  unknown:  t.textDim,
}[sev] || t.textDim);

const severityIcon = (sev) => ({
  critical: XCircle,
  warning:  AlertTriangle,
  elevated: AlertTriangle,
  normal:   CheckCircle,
  unknown:  Info,
}[sev] || Info);

// Mechanism display names
const MECHANISM_LABELS = {
  sulfidic:   "Sulfidic / H₂S",
  naphthenic: "Naphthenic Acid",
  co2:        "CO₂ / Sweet",
  hcl:        "HCl Overhead",
  h2so4:      "H₂SO₄",
  nh4hs:      "NH₄HS",
};

// ── UNIT SUMMARY CARD ─────────────────────────────────────────────────────────
function UnitSummaryCard({ data, onClick, t }) {
  const [hov, setHov] = useState(false);
  if (!data) return <Skeleton w="100%" h={130} r={10} t={t} />;

  const sev   = data.unitSeverity || "normal";
  const color = severityColor(sev, t);
  const Icon  = severityIcon(sev);
  const rate  = data.totalRateMmYr ?? data.corrosionRate?.total?.value;
  const worst = data.worstPoint || data.monitorPoints?.[0];

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"16px", borderRadius:"12px", cursor:"pointer",
        background: hov ? t.bgCardHover : t.bgCard,
        border:`1px solid ${hov ? color+"60" : sev==="critical" ? color+"40" : t.border}`,
        boxShadow: t.shadow, transition:"all 0.2s", position:"relative", overflow:"hidden" }}>

      {/* Severity stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px",
        background:color, opacity: sev==="normal" ? 0.4 : 0.9 }} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize:"14px", fontWeight:700, color:t.textPrimary,
            fontFamily:"monospace" }}>{data.unitName}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div style={{ padding:"2px 8px", borderRadius:"4px",
            background:`${color}14`, border:`1px solid ${color}28` }}>
            <span style={{ fontSize:"8px", color, fontFamily:"monospace",
              textTransform:"uppercase", fontWeight:600 }}>{sev}</span>
          </div>
          <ChevronRight size={12} color={t.textDim} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
        <div>
          <div style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"2px" }}>
            Total Rate
          </div>
          <div style={{ fontSize:"18px", fontWeight:700, color, fontFamily:"monospace" }}>
            {rate != null ? rate.toFixed(3) : "—"}
          </div>
          <div style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace" }}>mm/year</div>
        </div>
        <div>
          <div style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"2px" }}>
            Dominant
          </div>
          <div style={{ fontSize:"10px", fontWeight:600, color:t.textPrimary,
            fontFamily:"monospace", lineHeight:1.4 }}>
            {MECHANISM_LABELS[data.dominantMechanism] || data.dominantMechanism || "—"}
          </div>
        </div>
      </div>

      {worst && (
        <div style={{ marginTop:"10px", paddingTop:"8px",
          borderTop:`1px solid ${t.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"9px", color:t.textMuted, fontFamily:"monospace" }}>
            {worst.tag || worst.location}
          </span>
          <span style={{ fontSize:"9px", color:worst.status==="critical" ? t.bad :
            worst.status==="warning" ? t.warn : t.good,
            fontFamily:"monospace", fontWeight:600 }}>
            {worst.remainingLifeYrs != null ? `${worst.remainingLifeYrs}y remaining` : "—"}
          </span>
        </div>
      )}

      {data.mode === "mock" && (
        <div style={{ position:"absolute", bottom:6, right:8,
          fontSize:"7px", color:t.textDim, fontFamily:"monospace" }}>MOCK</div>
      )}
    </div>
  );
}

// ── UNIT DETAIL VIEW ──────────────────────────────────────────────────────────
const DETAIL_TABS = ["Overview", "Mechanisms", "Wall Thickness", "Risk Flags"];

function UnitDetailView({ unitName, units, onBack, t, isDark }) {
  const [detail,    setDetail]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${BASE_URL}/corrosion/${unitName}`);
      const json = await res.json();
      setDetail(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [unitName]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const liveUnit = units.find(u => u.name === unitName);
  const Tip = makeTooltip(t);
  const tk  = tickStyle(t);

  if (loading) return (
    <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"14px" }}>
      <Skeleton w="60%" h={32} r={8} t={t} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
        {Array(4).fill(0).map((_,i) => <Skeleton key={i} w="100%" h={80} r={10} t={t} />)}
      </div>
      <Skeleton w="100%" h={220} r={10} t={t} />
    </div>
  );

  if (error) return (
    <div style={{ padding:"24px" }}>
      <div style={{ padding:"16px", borderRadius:"10px", background:`${t.bad}10`,
        border:`1px solid ${t.bad}30`, color:t.bad, fontFamily:"monospace", fontSize:"12px" }}>
        Error loading OLI data: {error}
      </div>
    </div>
  );

  if (!detail) return null;

  const sev   = detail.unitSeverity || "normal";
  const color = severityColor(sev, t);

  // Build mechanism chart data
  const mechData = Object.entries(detail.corrosionRate || {})
    .filter(([k]) => k !== "total")
    .map(([k, v]) => ({
      mechanism: MECHANISM_LABELS[k] || k,
      rate:      parseFloat((v?.value ?? 0).toFixed(4)),
      key: k,
    }))
    .filter(d => d.rate > 0)
    .sort((a,b) => b.rate - a.rate);

  // Wall thickness data
  const wallData = (detail.monitorPoints || []).map(p => ({
    tag:       p.tag?.replace(unitName+"-","") || p.location,
    nominal:   p.nominalMM,
    current:   p.currentMM,
    pct:       parseFloat(((p.currentMM / p.nominalMM) * 100).toFixed(1)),
    status:    p.status,
    remaining: p.remainingLifeYrs,
    rate:      p.corrosionRateMmYr,
    inspection:p.nextInspection,
    location:  p.location,
  }));

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"auto" }}>

      {/* Header */}
      <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${t.border}`,
        flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"12px" }}>
          <button onClick={onBack} style={{ padding:"7px 12px", borderRadius:"8px",
            background:t.bgSubtle, border:`1px solid ${t.border}`,
            display:"flex", alignItems:"center", gap:"6px",
            cursor:"pointer", color:t.textMuted, fontSize:"11px", fontFamily:"monospace" }}>
            <ArrowLeft size={13} /> All Units
          </button>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <ShieldAlert size={16} color={color} />
              <span style={{ fontSize:"20px", fontWeight:700, color:t.textPrimary,
                fontFamily:"monospace" }}>{unitName}</span>
              <div style={{ padding:"3px 9px", borderRadius:"5px",
                background:`${color}14`, border:`1px solid ${color}28` }}>
                <span style={{ fontSize:"9px", color, fontFamily:"monospace",
                  textTransform:"uppercase", fontWeight:600 }}>{sev}</span>
              </div>
              {detail.mode === "mock" && (
                <div style={{ padding:"3px 9px", borderRadius:"5px",
                  background:t.bgSubtle, border:`1px solid ${t.border}` }}>
                  <span style={{ fontSize:"9px", color:t.textDim, fontFamily:"monospace" }}>
                    OLI MOCK MODE
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize:"10px", color:t.textMuted, fontFamily:"monospace",
              marginTop:"3px" }}>
              {detail.oliVersion} · Calc ID: {detail.calculationId}
            </div>
          </div>
          <button onClick={fetchDetail} style={{ marginLeft:"auto", padding:"7px 12px",
            borderRadius:"8px", background:t.bgSubtle, border:`1px solid ${t.border}`,
            display:"flex", alignItems:"center", gap:"6px",
            cursor:"pointer", color:t.textMuted, fontSize:"11px", fontFamily:"monospace" }}>
            <RefreshCw size={12} /> Recalculate
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:"flex", gap:"2px", background:t.bgSubtle,
          border:`1px solid ${t.border}`, borderRadius:"9px", padding:"3px",
          width:"fit-content" }}>
          {DETAIL_TABS.map(tb => (
            <button key={tb} onClick={() => setActiveTab(tb)} style={{
              padding:"5px 14px", borderRadius:"7px", border:"none", cursor:"pointer",
              fontSize:"11px", fontFamily:"monospace",
              background: activeTab===tb ? t.tabActive : "transparent",
              color: activeTab===tb ? t.tabText : t.tabInactive,
              transition:"all 0.15s" }}>{tb}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, padding:"20px 24px", overflow:"auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "Overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* KPI row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
              {[
                { label:"Total Corrosion Rate", value:`${detail.corrosionRate?.total?.value?.toFixed(3) ?? "—"} mm/yr`, color },
                { label:"Operating Temp",  value:`${detail.conditions?.temperature?.value ?? liveUnit?.temp ?? "—"} °C`, color:t.amber },
                { label:"Operating Press", value:`${detail.conditions?.pressure?.value ?? liveUnit?.pressure ?? "—"} bara`, color:t.blue },
                { label:"Stream pH",       value:detail.streamChemistry?.pH?.value?.toFixed(2) ?? "—", color:t.teal },
              ].map(({ label, value, color:c }) => (
                <div key={label} style={{ padding:"14px 16px", borderRadius:"10px",
                  background:t.bgCard, border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
                  <div style={{ fontSize:"9px", color:t.textMuted, fontFamily:"monospace",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{label}</div>
                  <div style={{ fontSize:"20px", fontWeight:700, color:c,
                    fontFamily:"monospace" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Stream chemistry */}
            <div style={{ padding:"16px", borderRadius:"10px", background:t.bgCard,
              border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
              <div style={{ fontSize:"11px", fontWeight:600, color:t.textPrimary,
                fontFamily:"monospace", marginBottom:"12px" }}>Stream Chemistry</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
                {[
                  { label:"H₂S Concentration", value:`${detail.streamChemistry?.h2sConc?.value?.toFixed(1) ?? "—"} mg/L` },
                  { label:"CO₂ Partial Press",  value:`${detail.streamChemistry?.co2PartialPress?.value?.toFixed(3) ?? "—"} bar` },
                  { label:"Dominant Mechanism", value: MECHANISM_LABELS[detail.dominantMechanism] || detail.dominantMechanism || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding:"10px 12px", borderRadius:"8px",
                    background:t.bgSubtle, border:`1px solid ${t.border}` }}>
                    <div style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace",
                      textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>{label}</div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:t.textPrimary,
                      fontFamily:"monospace" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitor points summary */}
            <div style={{ padding:"16px", borderRadius:"10px", background:t.bgCard,
              border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
              <div style={{ fontSize:"11px", fontWeight:600, color:t.textPrimary,
                fontFamily:"monospace", marginBottom:"12px" }}>
                Monitor Points — Remaining Life Summary
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {wallData.map(p => {
                  const ptColor = p.status==="critical" ? t.bad : p.status==="warning" ? t.warn : t.good;
                  return (
                    <div key={p.tag} style={{ display:"flex", alignItems:"center",
                      gap:"12px", padding:"8px 12px", borderRadius:"7px",
                      background:t.bgSubtle, border:`1px solid ${ptColor}20` }}>
                      <div style={{ width:"8px", height:"8px", borderRadius:"50%",
                        background:ptColor, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"10px", fontWeight:600, color:t.textPrimary,
                          fontFamily:"monospace" }}>{p.tag}</div>
                        <div style={{ fontSize:"8px", color:t.textMuted,
                          fontFamily:"monospace" }}>{p.location}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:"11px", fontWeight:700, color:ptColor,
                          fontFamily:"monospace" }}>
                          {p.remaining != null ? `${p.remaining}y` : "—"}
                        </div>
                        <div style={{ fontSize:"8px", color:t.textDim,
                          fontFamily:"monospace" }}>remaining</div>
                      </div>
                      <div style={{ textAlign:"right", minWidth:"80px" }}>
                        <div style={{ fontSize:"10px", color:t.textSecondary,
                          fontFamily:"monospace" }}>
                          {p.rate != null ? `${p.rate.toFixed(3)} mm/yr` : "—"}
                        </div>
                        <div style={{ fontSize:"8px", color:t.textDim,
                          fontFamily:"monospace" }}>Next: {p.inspection}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MECHANISMS TAB ── */}
        {activeTab === "Mechanisms" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>

              {/* Bar chart */}
              <div style={{ padding:"18px", borderRadius:"10px", background:t.bgCard,
                border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
                <div style={{ fontSize:"11px", fontWeight:600, color:t.textPrimary,
                  fontFamily:"monospace", marginBottom:"4px" }}>
                  Corrosion Rate by Mechanism
                </div>
                <div style={{ fontSize:"9px", color:t.textMuted, fontFamily:"monospace",
                  textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"14px" }}>mm/year</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mechData} layout="vertical"
                    margin={{ top:0, right:40, bottom:0, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.grid} horizontal={false} />
                    <XAxis type="number" tick={{...tk,fontSize:9}} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="mechanism"
                      tick={{...tk,fontSize:9}} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="rate" name="mm/year" radius={[0,4,4,0]}>
                      {mechData.map((e,i) => (
                        <Cell key={i}
                          fill={e.key === detail.dominantMechanism ? color : t.accent}
                          fillOpacity={e.key === detail.dominantMechanism ? 0.9 : 0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mechanism table */}
              <div style={{ padding:"18px", borderRadius:"10px", background:t.bgCard,
                border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
                <div style={{ fontSize:"11px", fontWeight:600, color:t.textPrimary,
                  fontFamily:"monospace", marginBottom:"14px" }}>Mechanism Detail</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {mechData.map(m => {
                    const pctOfTotal = detail.corrosionRate?.total?.value
                      ? parseFloat(((m.rate / detail.corrosionRate.total.value) * 100).toFixed(1))
                      : 0;
                    const isDominant = m.key === detail.dominantMechanism;
                    return (
                      <div key={m.key} style={{ padding:"10px 12px", borderRadius:"7px",
                        background: isDominant ? `${color}08` : t.bgSubtle,
                        border:`1px solid ${isDominant ? color+"30" : t.border}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:"4px" }}>
                          <span style={{ fontSize:"11px", fontWeight: isDominant ? 700 : 400,
                            color: isDominant ? color : t.textPrimary,
                            fontFamily:"monospace" }}>
                            {m.mechanism}
                            {isDominant && <span style={{ fontSize:"8px", marginLeft:"6px",
                              color, fontFamily:"monospace" }}>● DOMINANT</span>}
                          </span>
                          <span style={{ fontSize:"12px", fontWeight:700, color: isDominant ? color : t.textPrimary,
                            fontFamily:"monospace" }}>{m.rate.toFixed(4)}</span>
                        </div>
                        <div style={{ height:"4px", borderRadius:"2px", background:t.bgInset }}>
                          <div style={{ height:"100%", width:`${pctOfTotal}%`, borderRadius:"2px",
                            background: isDominant ? color : t.accent, opacity:0.7 }} />
                        </div>
                        <div style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace",
                          marginTop:"3px", textAlign:"right" }}>{pctOfTotal}% of total</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding:"12px 16px", borderRadius:"8px",
              background:t.accentSoft, border:`1px solid ${t.accent}25`,
              fontSize:"9px", color:t.textSecondary, fontFamily:"monospace", lineHeight:1.7 }}>
              <strong style={{ color:t.textPrimary }}>OLI Engine Note:</strong> Rates computed using
              first-principles electrolyte thermodynamics (MSE framework). Sulfidic rates follow
              McConomy/API 939-C curves. Naphthenic acid follows Couper-Gorman/API 581.
              CO₂ rates follow de Waard-Milliams model.
              {detail.mode === "mock" && " Currently running in mock mode — connect OLI credentials for live calculation."}
            </div>
          </div>
        )}

        {/* ── WALL THICKNESS TAB ── */}
        {activeTab === "Wall Thickness" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            <div style={{ padding:"18px", borderRadius:"10px", background:t.bgCard,
              border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
              <div style={{ fontSize:"11px", fontWeight:600, color:t.textPrimary,
                fontFamily:"monospace", marginBottom:"4px" }}>
                Wall Thickness — Nominal vs. Current (mm)
              </div>
              <div style={{ fontSize:"9px", color:t.textMuted, fontFamily:"monospace",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"14px" }}>
                Retirement limit: 75% nominal · Alert: 85% nominal
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wallData} margin={{ top:0, right:0, bottom:20, left:-10 }}
                  barGap={2} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                  <XAxis dataKey="tag" tick={{...tk,fontSize:9}} axisLine={false} tickLine={false}
                    angle={-20} textAnchor="end" />
                  <YAxis tick={tk} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="nominal" name="Nominal (mm)" fill={t.bgInset}
                    fillOpacity={0.6} radius={[3,3,0,0]} />
                  <Bar dataKey="current" name="Current (mm)" radius={[3,3,0,0]}>
                    {wallData.map((e,i) => (
                      <Cell key={i}
                        fill={e.status==="critical" ? t.bad : e.status==="warning" ? t.warn : t.good}
                        fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed table */}
            <div style={{ borderRadius:"10px", background:t.bgCard,
              border:`1px solid ${t.border}`, boxShadow:t.shadow, overflow:"hidden" }}>
              <div style={{ display:"grid",
                gridTemplateColumns:"1fr 1.5fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.8fr",
                padding:"8px 16px", background:t.bgSubtle,
                borderBottom:`1px solid ${t.border}` }}>
                {["Tag","Location","Nominal","Current","Loss %","Rate mm/yr","Life (yr)","Next Insp."].map(h => (
                  <span key={h} style={{ fontSize:"8px", color:t.textDim, fontFamily:"monospace",
                    textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</span>
                ))}
              </div>
              {wallData.map((p,i) => {
                const ptColor = p.status==="critical" ? t.bad : p.status==="warning" ? t.warn : t.good;
                return (
                  <div key={p.tag} style={{ display:"grid",
                    gridTemplateColumns:"1fr 1.5fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.8fr",
                    padding:"10px 16px", alignItems:"center",
                    background:i%2===0?"transparent":t.bgSubtle,
                    borderBottom:`1px solid ${t.border}` }}>
                    <span style={{ fontSize:"10px", fontWeight:700, color:t.accent,
                      fontFamily:"monospace" }}>{p.tag}</span>
                    <span style={{ fontSize:"9px", color:t.textSecondary,
                      fontFamily:"monospace" }}>{p.location}</span>
                    <span style={{ fontSize:"10px", color:t.textMuted,
                      fontFamily:"monospace" }}>{p.nominal}</span>
                    <span style={{ fontSize:"10px", fontWeight:700, color:ptColor,
                      fontFamily:"monospace" }}>{p.current}</span>
                    <span style={{ fontSize:"10px", color:ptColor,
                      fontFamily:"monospace" }}>{p.pct ? (100-p.pct).toFixed(1)+"%" : "—"}</span>
                    <span style={{ fontSize:"10px", color:t.textPrimary,
                      fontFamily:"monospace" }}>{p.rate?.toFixed(3) ?? "—"}</span>
                    <span style={{ fontSize:"10px", fontWeight:700, color:ptColor,
                      fontFamily:"monospace" }}>
                      {p.remaining != null ? p.remaining : "—"}
                    </span>
                    <div style={{ padding:"2px 6px", borderRadius:"4px", width:"fit-content",
                      background:`${ptColor}14`, border:`1px solid ${ptColor}28` }}>
                      <span style={{ fontSize:"8px", color:ptColor,
                        fontFamily:"monospace" }}>{p.inspection}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RISK FLAGS TAB ── */}
        {activeTab === "Risk Flags" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px" }}>
              {Object.entries(detail.riskFlags || {}).map(([flag, value]) => {
                const labels = {
                  hthaRisk:           "High-Temp H₂ Attack (HTHA) — API 941",
                  polythionicAcidSCC: "Polythionic Acid Stress Corrosion Cracking",
                  stressCorrCracking: "Stress Corrosion Cracking (SCC) / SOHIC",
                  thermalFatigue:     "Thermal Fatigue — Coke Drum Cycling",
                };
                const descriptions = {
                  hthaRisk:           "Risk per API 941 Nelson curves. High H₂ partial pressure + temperature can cause irreversible steel embrittlement.",
                  polythionicAcidSCC: "Risk during shutdowns when polythionic acid forms on catalytic surfaces. Use austenitic SS or neutralize with soda ash.",
                  stressCorrCracking: "Wet H₂S service. Risk of hydrogen-induced cracking (HIC) and stress-oriented HIC (SOHIC) in weld HAZ.",
                  thermalFatigue:     "Repeated thermal cycling of coke drums causes weld cracking and shell distortion. Monitor bulging and skirt cracking.",
                };
                const isActive = value === true || value === "high" || value === "elevated";
                const flagColor = value === "high" ? t.bad :
                                  value === "elevated" || isActive ? t.warn : t.good;
                const FlagIcon  = value === "high" || isActive ? AlertTriangle : CheckCircle;

                return (
                  <div key={flag} style={{ padding:"16px", borderRadius:"10px",
                    background: isActive ? `${flagColor}08` : t.bgCard,
                    border:`1px solid ${isActive ? flagColor+"30" : t.border}`,
                    boxShadow:t.shadow }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                      <FlagIcon size={14} color={flagColor} />
                      <span style={{ fontSize:"11px", fontWeight:600, color:flagColor,
                        fontFamily:"monospace" }}>{labels[flag] || flag}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                      <div style={{ padding:"2px 8px", borderRadius:"4px",
                        background:`${flagColor}14`, border:`1px solid ${flagColor}28` }}>
                        <span style={{ fontSize:"9px", color:flagColor,
                          fontFamily:"monospace", fontWeight:600, textTransform:"uppercase" }}>
                          {typeof value === "boolean" ? (value ? "Active" : "Clear") : value}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize:"9px", color:t.textSecondary,
                      fontFamily:"monospace", lineHeight:1.6 }}>
                      {descriptions[flag]}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding:"12px 16px", borderRadius:"8px",
              background:t.amberSoft, border:`1px solid ${t.amber}25`,
              fontSize:"9px", color:t.textSecondary, fontFamily:"monospace", lineHeight:1.7 }}>
              <strong style={{ color:t.textPrimary }}>Inspection basis:</strong> API 510 (pressure vessels) ·
              API 570 (piping) · API 579 (fitness for service) · API 941 (HTHA) ·
              API 939-C (sulfidic corrosion) · API 581 (RBI)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN CORROSION PAGE ────────────────────────────────────────────────────────
export default function Corrosion({ t, isDark, corrosion = [], units = [], onUnitClick }) {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);

  // Map array to lookup by unit name
  const corrosionMap = {};
  corrosion.forEach(c => { corrosionMap[c.unitName] = c; });

  const MONITORED = ["CDU-1","CDU-2","FCC-1","HCR-1","DCK-1","DCK-2","ALK-1"];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${BASE_URL}/corrosion/refresh`, { method:"POST" });
    } finally {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  if (selectedUnit) {
    return (
      <UnitDetailView
        unitName={selectedUnit}
        units={units}
        onBack={() => setSelectedUnit(null)}
        t={t} isDark={isDark}
      />
    );
  }

  // Summary stats
  const allData     = MONITORED.map(n => corrosionMap[n]).filter(Boolean);
  const critical    = allData.filter(d => d.unitSeverity === "critical").length;
  const warning     = allData.filter(d => d.unitSeverity === "warning").length;
  const maxRate     = allData.length
    ? Math.max(...allData.map(d => d.totalRateMmYr ?? d.corrosionRate?.total?.value ?? 0))
    : 0;

  return (
    <div style={{ padding:"24px", height:"100%", overflow:"auto" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:"20px" }}>
        <div>
          <div style={{ fontSize:"20px", fontWeight:700, color:t.textPrimary,
            fontFamily:"monospace", marginBottom:"4px" }}>Corrosion Monitoring</div>
          <div style={{ fontSize:"11px", color:t.textMuted, fontFamily:"monospace",
            textTransform:"uppercase", letterSpacing:"0.08em" }}>
            OLI Systems Engine API · {allData[0]?.mode === "mock" ? "Mock Mode" : "Live"} ·
            7 units monitored · Updates every 90s
          </div>
        </div>
        <button onClick={handleRefresh}
          style={{ display:"flex", alignItems:"center", gap:"7px", padding:"8px 14px",
            borderRadius:"8px", background:t.bgCard, border:`1px solid ${t.border}`,
            cursor:"pointer", color:t.textMuted, fontSize:"11px", fontFamily:"monospace",
            transition:"all 0.15s" }}>
          <RefreshCw size={13} color={t.textMuted}
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          Recalculate All
        </button>
      </div>

      {/* Summary banner */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:"12px", marginBottom:"20px" }}>
        {[
          { label:"Critical Units",  value:critical,           color:critical > 0 ? t.bad   : t.good },
          { label:"Warning Units",   value:warning,            color:warning  > 0 ? t.warn  : t.good },
          { label:"Max Rate (mm/yr)",value:maxRate.toFixed(3), color:maxRate > 0.5 ? t.warn  : t.good },
          { label:"Units Monitored", value:MONITORED.length,   color:t.accent },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding:"14px 16px", borderRadius:"10px",
            background:t.bgCard, border:`1px solid ${t.border}`, boxShadow:t.shadow }}>
            <div style={{ fontSize:"9px", color:t.textMuted, fontFamily:"monospace",
              textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>{label}</div>
            <div style={{ fontSize:"26px", fontWeight:700, color, fontFamily:"monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* OLI mock mode notice */}
      {allData[0]?.mode === "mock" && (
        <div style={{ marginBottom:"16px", padding:"10px 16px", borderRadius:"8px",
          background:t.accentSoft, border:`1px solid ${t.accent}28`,
          display:"flex", alignItems:"center", gap:"10px" }}>
          <Info size={13} color={t.accent} />
          <span style={{ fontSize:"10px", color:t.textSecondary, fontFamily:"monospace", lineHeight:1.6 }}>
            <strong style={{ color:t.accent }}>Mock mode active.</strong> Rates computed by built-in
            empirical models (McConomy, Couper-Gorman, de Waard-Milliams).
            To enable live OLI Cloud: set <code style={{ background:t.bgSubtle, padding:"1px 5px",
            borderRadius:"3px" }}>OLI_MOCK=false</code> and add credentials in{" "}
            <code style={{ background:t.bgSubtle, padding:"1px 5px", borderRadius:"3px" }}>api-server/.env</code>
          </span>
        </div>
      )}

      {/* Unit grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr) ", gap:"12px" }}>
        {MONITORED.map(name => (
          <UnitSummaryCard
            key={name}
            data={corrosionMap[name] || null}
            onClick={() => setSelectedUnit(name)}
            t={t}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
