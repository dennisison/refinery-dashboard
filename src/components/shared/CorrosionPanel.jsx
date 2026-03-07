/**
 * CorrosionPanel.jsx
 * Compact corrosion summary panel for the Overview dashboard.
 * Shows worst-case unit, top 4 alert points, and rate sparkline.
 * Click any row → navigates to Corrosion page via onNavigate callback.
 */
import { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle,
         ChevronRight, Info } from "lucide-react";

const MECHANISM_SHORT = {
  sulfidic:   "H₂S",
  naphthenic: "Naphth.",
  co2:        "CO₂",
  hcl:        "HCl",
  h2so4:      "H₂SO₄",
  nh4hs:      "NH₄HS",
};

export default function CorrosionPanel({ corrosion = [], onNavigate, t }) {
  const [hov, setHov] = useState(null);

  if (!corrosion.length) {
    return (
      <div style={{ padding:"18px", borderRadius:"12px", background:t.bgCard,
        border:`1px solid ${t.border}`, boxShadow:t.shadow,
        display:"flex", alignItems:"center", gap:"10px" }}>
        <ShieldAlert size={16} color={t.textDim} />
        <span style={{ fontSize:"10px", color:t.textDim, fontFamily:"monospace" }}>
          Loading OLI corrosion data...
        </span>
      </div>
    );
  }

  // Sort by severity priority
  const PRIORITY = { critical:0, warning:1, elevated:2, normal:3, unknown:4 };
  const sorted = [...corrosion].sort((a,b) =>
    (PRIORITY[a.unitSeverity]??4) - (PRIORITY[b.unitSeverity]??4)
  );

  const critical = corrosion.filter(c => c.unitSeverity === "critical").length;
  const warning  = corrosion.filter(c => c.unitSeverity === "warning").length;

  const severityColor = (sev) => ({
    critical: t.bad,
    warning:  t.warn,
    elevated: t.amber,
    normal:   t.good,
    unknown:  t.textDim,
  }[sev] || t.textDim);

  const SevIcon = (sev) => ({
    critical: XCircle,
    warning:  AlertTriangle,
    elevated: AlertTriangle,
    normal:   CheckCircle,
    unknown:  Info,
  }[sev] || Info);

  return (
    <div style={{ background:t.bgCard, border:`1px solid ${t.border}`,
      borderRadius:"12px", padding:"18px", boxShadow:t.shadow }}>

      {/* Panel header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <ShieldAlert size={14} color={critical > 0 ? t.bad : warning > 0 ? t.warn : t.accent} />
          <span style={{ fontSize:"12px", fontWeight:600, color:t.textPrimary,
            fontFamily:"monospace" }}>Corrosion Status</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          {critical > 0 && (
            <div style={{ padding:"2px 8px", borderRadius:"4px",
              background:`${t.bad}14`, border:`1px solid ${t.bad}28` }}>
              <span style={{ fontSize:"9px", color:t.bad, fontFamily:"monospace",
                fontWeight:600 }}>{critical} CRITICAL</span>
            </div>
          )}
          {warning > 0 && (
            <div style={{ padding:"2px 8px", borderRadius:"4px",
              background:`${t.warn}14`, border:`1px solid ${t.warn}28` }}>
              <span style={{ fontSize:"9px", color:t.warn, fontFamily:"monospace",
                fontWeight:600 }}>{warning} WARN</span>
            </div>
          )}
          <button onClick={() => onNavigate("corrosion")}
            style={{ display:"flex", alignItems:"center", gap:"4px",
              padding:"3px 9px", borderRadius:"5px", border:`1px solid ${t.accent}30`,
              background:t.accentSoft, cursor:"pointer",
              fontSize:"9px", color:t.accent, fontFamily:"monospace" }}>
            View All <ChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* Unit rows */}
      <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
        {sorted.slice(0, 6).map(c => {
          const color = severityColor(c.unitSeverity);
          const Icon  = SevIcon(c.unitSeverity);
          const rate  = c.totalRateMmYr ?? c.corrosionRate?.total?.value;
          const isHov = hov === c.unitName;
          return (
            <div key={c.unitName}
              onClick={() => onNavigate("corrosion", c.unitName)}
              onMouseEnter={() => setHov(c.unitName)}
              onMouseLeave={() => setHov(null)}
              style={{ display:"flex", alignItems:"center", gap:"10px",
                padding:"7px 10px", borderRadius:"7px", cursor:"pointer",
                background: isHov ? t.bgCardHover : t.bgSubtle,
                border:`1px solid ${isHov ? color+"40" : "transparent"}`,
                transition:"all 0.15s" }}>

              <Icon size={11} color={color} style={{ flexShrink:0 }} />

              <span style={{ fontSize:"11px", fontWeight:700, color:t.textPrimary,
                fontFamily:"monospace", minWidth:"52px" }}>{c.unitName}</span>

              {/* Rate bar */}
              <div style={{ flex:1, height:"4px", borderRadius:"2px",
                background:t.bgInset, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:"2px", background:color,
                  width:`${Math.min(100, (rate ?? 0) * 100)}%`,
                  transition:"width 0.8s ease" }} />
              </div>

              <span style={{ fontSize:"10px", fontWeight:600, color,
                fontFamily:"monospace", minWidth:"52px", textAlign:"right" }}>
                {rate != null ? `${rate.toFixed(3)}` : "—"}
              </span>

              <span style={{ fontSize:"9px", color:t.textDim,
                fontFamily:"monospace", minWidth:"38px" }}>mm/yr</span>

              <span style={{ fontSize:"9px", color:t.textMuted,
                fontFamily:"monospace", minWidth:"52px" }}>
                {MECHANISM_SHORT[c.dominantMechanism] || "—"}
              </span>

              {isHov && <ChevronRight size={10} color={t.textDim} />}
            </div>
          );
        })}
      </div>

      {corrosion[0]?.mode === "mock" && (
        <div style={{ marginTop:"10px", fontSize:"8px", color:t.textDim,
          fontFamily:"monospace", textAlign:"right" }}>
          OLI mock mode · set OLI_MOCK=false for live calculations
        </div>
      )}
    </div>
  );
}
