/**
 * UnitsDetail.jsx
 * Two views:
 *   1. Unit list  — grid of all units with live status, click any → drill-down
 *   2. Unit detail — full single-unit view with 24h trend charts for temp/pressure/load
 */
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Gauge,
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import { makeTooltip, tickStyle, Skeleton } from "../shared/Theme";

// Generate 24h trend for a unit parameter
function generateUnitTrend(baseValue, range, hours = 24) {
  return Array.from({ length: hours }, (_, i) => {
    const ts = new Date(Date.now() - (hours - 1 - i) * 3600000);
    const hh = ts.getHours().toString().padStart(2, "0");
    const noise = (Math.random() - 0.5) * range;
    return {
      time: `${hh}:00`,
      value: parseFloat(Math.max(0, baseValue + noise).toFixed(1)),
    };
  });
}

const UNIT_DESCRIPTIONS = {
  "CDU-1":
    "Atmospheric crude distillation. Separates incoming crude into naphtha, kerosene, diesel, and atmospheric residue fractions via fractional distillation.",
  "CDU-2":
    "Secondary atmospheric crude distillation unit. Handles overflow crude feed and lighter crude grades from the SJV pipeline.",
  "VDU-1":
    "Vacuum distillation of atmospheric residue from CDU-1/2. Produces vacuum gasoil (VGO) feed for FCC and hydrocracker, plus vacuum residue for cokers.",
  "FCC-1":
    "Fluid catalytic cracker converts VGO into high-octane gasoline blendstock and light olefins. Regenerator burns coke off catalyst continuously.",
  "HCR-1":
    "Hydrocracker converts VGO to premium distillates under high H₂ pressure. Produces high-cetane diesel and jet fuel with very low sulfur content.",
  "DCK-1":
    "Delayed coker thermally cracks vacuum residue into fuel-grade petroleum coke, naphtha, and gas oil. Batch drum cycle: ~18h fill, ~18h cutting.",
  "DCK-2":
    "Delayed coker producing anode-grade (premium) petroleum coke for aluminum smelting. Feed quality closely monitored for metals/sulfur spec.",
  "RFM-1":
    "Catalytic reformer converts naphtha to high-octane reformate for CARB gasoline blending. Produces hydrogen byproduct for hydrotreaters.",
  "ALK-1":
    "Sulfuric acid alkylation unit combines isobutane + olefins to produce high-octane, low-RVP alkylate for CARB gasoline blending.",
  "HDS-1":
    "Naphtha hydrotreater — currently offline for planned 18-day turnaround. Removes sulfur from naphtha before reformer feed.",
  COGEN:
    "On-site combined heat and power plant. Burns refinery fuel gas to produce 400 MW electricity and 600 klb/hr steam for process use and grid export.",
};

const UNIT_KEY_PARAMS = {
  "CDU-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Flash Zone Temp", key: "temp", unit: "°C", color: "#9c6010" },
    {
      label: "Tower Pressure",
      key: "pressure",
      unit: "barg",
      color: "#0a6e8a",
    },
  ],
  "CDU-2": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Flash Zone Temp", key: "temp", unit: "°C", color: "#9c6010" },
    {
      label: "Tower Pressure",
      key: "pressure",
      unit: "barg",
      color: "#0a6e8a",
    },
  ],
  "VDU-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Transfer Temp", key: "temp", unit: "°C", color: "#9c6010" },
    {
      label: "Flash Zone Vac",
      key: "pressure",
      unit: "mmHg",
      color: "#6040a0",
    },
  ],
  "FCC-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Regen Temp", key: "temp", unit: "°C", color: "#b52218" },
    { label: "Reactor Press", key: "pressure", unit: "barg", color: "#0a6e8a" },
  ],
  "HCR-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Rx Bed Temp", key: "temp", unit: "°C", color: "#9c6010" },
    {
      label: "H₂ Partial Press",
      key: "pressure",
      unit: "barg",
      color: "#0a6e8a",
    },
  ],
  "DCK-1": [
    { label: "Drum Fill", key: "load", unit: "%", color: "#1a538a" },
    { label: "Heater Outlet", key: "temp", unit: "°C", color: "#9c6010" },
    { label: "Drum Pressure", key: "pressure", unit: "barg", color: "#0a6e8a" },
  ],
  "DCK-2": [
    { label: "Drum Fill", key: "load", unit: "%", color: "#1a538a" },
    { label: "Heater Outlet", key: "temp", unit: "°C", color: "#9c6010" },
    { label: "Drum Pressure", key: "pressure", unit: "barg", color: "#0a6e8a" },
  ],
  "RFM-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Rx Outlet Temp", key: "temp", unit: "°C", color: "#9c6010" },
    { label: "Rx Pressure", key: "pressure", unit: "barg", color: "#0a6e8a" },
  ],
  "ALK-1": [
    { label: "Feed Rate", key: "load", unit: "%", color: "#1a538a" },
    { label: "Reactor Temp", key: "temp", unit: "°C", color: "#0a6e8a" },
    { label: "Acid Pressure", key: "pressure", unit: "barg", color: "#6040a0" },
  ],
  "HDS-1": [],
  COGEN: [
    { label: "Load", key: "load", unit: "%", color: "#1a538a" },
    { label: "Turbine Temp", key: "temp", unit: "°C", color: "#b52218" },
    { label: "Steam Press", key: "pressure", unit: "barg", color: "#0a6e8a" },
  ],
};

// ── UNIT DETAIL VIEW ──────────────────────────────────────────────────────────
function UnitDetailView({ unit, onBack, t, isDark }) {
  const [trends, setTrends] = useState(null);
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);
  const params = UNIT_KEY_PARAMS[unit.name] || [];

  useEffect(() => {
    if (unit.status === "offline") {
      setTrends({});
      return;
    }
    setTrends({
      load: generateUnitTrend(unit.load, 4, 24),
      temp: generateUnitTrend(unit.temp, unit.temp * 0.015, 24),
      pressure: generateUnitTrend(unit.pressure, unit.pressure * 0.02, 24),
    });
  }, [unit.name]);

  const sc =
    unit.status === "optimal"
      ? t.good
      : unit.status === "warning"
        ? t.warn
        : t.offline;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      {/* Back + header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: t.bgSubtle,
            border: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            color: t.textMuted,
            fontSize: "11px",
            fontFamily: "monospace",
            marginTop: "2px",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={13} />
          All Units
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: sc,
                boxShadow: unit.status !== "offline" ? `0 0 8px ${sc}` : "none",
              }}
            />
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: t.textPrimary,
                fontFamily: "monospace",
              }}
            >
              {unit.name}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: t.textMuted,
                fontFamily: "monospace",
                background: t.bgSubtle,
                border: `1px solid ${t.border}`,
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {unit.site} PLANT
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: sc,
                background: `${sc}12`,
                border: `1px solid ${sc}28`,
                padding: "2px 8px",
                borderRadius: "4px",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              {unit.status}
            </span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.textSecondary,
              fontFamily: "monospace",
            }}
          >
            {unit.product}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: t.textDim,
              fontFamily: "monospace",
              marginTop: "6px",
              lineHeight: 1.6,
            }}
          >
            {UNIT_DESCRIPTIONS[unit.name]}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px", flex: 1 }}>
        {unit.status === "offline" ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              background: t.bgInset,
              border: `1px solid ${t.border}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: t.textMuted,
                fontFamily: "monospace",
                marginBottom: "8px",
              }}
            >
              Unit offline — no live data available
            </div>
            <div
              style={{
                fontSize: "11px",
                color: t.textDim,
                fontFamily: "monospace",
              }}
            >
              {unit.name === "HDS-1"
                ? "Planned turnaround in progress. Day 4 of 18."
                : "Unit depressurized and isolated."}
            </div>
          </div>
        ) : (
          <>
            {/* Live readings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {[
                {
                  label: "Load",
                  value: `${unit.load}%`,
                  icon: Activity,
                  color: t.accent,
                },
                {
                  label: "Temp",
                  value: `${unit.temp}°C`,
                  icon: Thermometer,
                  color: t.amber,
                },
                {
                  label: "Pressure",
                  value: `${unit.pressure > 0 ? unit.pressure + " barg" : "Depressurized"}`,
                  icon: Gauge,
                  color: t.blue,
                },
                {
                  label: "Design",
                  value: unit.design,
                  icon: Zap,
                  color: t.teal,
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: t.bgCard,
                    border: `1px solid ${t.border}`,
                    boxShadow: t.shadow,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: t.textMuted,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {label}
                    </span>
                    <Icon size={12} color={color} />
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: t.textPrimary,
                      fontFamily: "monospace",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* 24h trend charts */}
            <div
              style={{
                fontSize: "11px",
                color: t.textMuted,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px",
              }}
            >
              24-Hour Trend History
            </div>

            {!trends ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "14px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} w="100%" h={160} r={10} t={t} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "14px",
                }}
              >
                {params.map(({ label, key, unit: unit2, color }) => (
                  <div
                    key={key}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: t.bgCard,
                      border: `1px solid ${t.border}`,
                      boxShadow: t.shadow,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        color: t.textPrimary,
                        fontWeight: 600,
                        fontFamily: "monospace",
                        marginBottom: "2px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: t.textMuted,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "12px",
                      }}
                    >
                      {unit2} · last 24h
                    </div>
                    <ResponsiveContainer width="100%" height={130}>
                      <AreaChart
                        data={trends[key] || []}
                        margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                      >
                        <defs>
                          <linearGradient
                            id={`ug-${key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={color}
                              stopOpacity={isDark ? 0.2 : 0.12}
                            />
                            <stop
                              offset="95%"
                              stopColor={color}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                        <XAxis
                          dataKey="time"
                          tick={{ ...tk, fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                          interval={5}
                        />
                        <YAxis
                          tick={{ ...tk, fontSize: 8 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<Tip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={color}
                          strokeWidth={1.5}
                          fill={`url(#ug-${key})`}
                          dot={false}
                          isAnimationActive={false}
                          name={label}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── UNIT LIST VIEW ─────────────────────────────────────────────────────────────
export default function UnitsDetail({
  units,
  loading,
  activeUnit,
  onSelectUnit,
  onBack,
  t,
  isDark,
}) {
  const selectedUnit = units.find((u) => u.name === activeUnit);

  if (activeUnit && selectedUnit) {
    return (
      <UnitDetailView
        unit={selectedUnit}
        onBack={onBack}
        t={t}
        isDark={isDark}
      />
    );
  }

  const online = units.filter((u) => u.status !== "offline");
  const offline = units.filter((u) => u.status === "offline");
  const warning = units.filter((u) => u.status === "warning");

  return (
    <div style={{ padding: "24px", height: "100%", overflow: "auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: t.textPrimary,
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          Process Units
        </div>
        <div
          style={{
            fontSize: "11px",
            color: t.textMuted,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          North + South Plants · Click any unit to drill down
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: `${online.length} Online`, color: t.good },
          { label: `${warning.length} Warning`, color: t.warn },
          { label: `${offline.length} Offline`, color: t.offline },
        ].map(({ label, color }) => (
          <div
            key={label}
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: `${color}14`,
              border: `1px solid ${color}30`,
              fontSize: "11px",
              color,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} w="100%" h={140} r={10} t={t} />
            ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {units.map((u) => {
            const sc =
              u.status === "optimal"
                ? t.good
                : u.status === "warning"
                  ? t.warn
                  : t.offline;
            const siteColor = u.site === "NORTH" ? t.accent : t.blue;
            return (
              <div
                key={u.name}
                onClick={() => u.status !== "offline" && onSelectUnit(u.name)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: t.bgCard,
                  border: `1px solid ${u.status === "warning" ? t.warn + "40" : t.border}`,
                  boxShadow: t.shadow,
                  cursor: u.status !== "offline" ? "pointer" : "default",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (u.status !== "offline") {
                    e.currentTarget.style.borderColor = t.accent + "60";
                    e.currentTarget.style.background = t.bgCardHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    u.status === "warning" ? t.warn + "40" : t.border;
                  e.currentTarget.style.background = t.bgCard;
                }}
              >
                {/* Status stripe */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: sc,
                    opacity: u.status === "offline" ? 0.3 : 0.8,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: sc,
                        boxShadow:
                          u.status !== "offline" ? `0 0 6px ${sc}` : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: t.textPrimary,
                        fontFamily: "monospace",
                      }}
                    >
                      {u.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "8px",
                        color: siteColor,
                        fontFamily: "monospace",
                        background: `${siteColor}15`,
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      {u.site}
                    </span>
                    {u.status !== "offline" && (
                      <ChevronRight size={13} color={t.textDim} />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    color: t.textMuted,
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {u.product}
                </div>

                {u.status === "offline" ? (
                  <div
                    style={{
                      fontSize: "10px",
                      color: t.offline,
                      fontFamily: "monospace",
                      background: t.bgInset,
                      padding: "8px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    Offline — Turnaround
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      {[
                        ["Load", `${u.load}%`],
                        ["Temp", `${u.temp}°C`],
                        ["Press", `${u.pressure} bg`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "8px",
                              color: t.textDim,
                              fontFamily: "monospace",
                              textTransform: "uppercase",
                              marginBottom: "2px",
                            }}
                          >
                            {k}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: t.textPrimary,
                              fontFamily: "monospace",
                            }}
                          >
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: "4px",
                        borderRadius: "2px",
                        background: t.bgInset,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${u.load}%`,
                          borderRadius: "2px",
                          background: sc,
                          transition: "width 0.8s ease",
                          boxShadow: `0 0 4px ${sc}55`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "8px",
                        color: t.textDim,
                        fontFamily: "monospace",
                        textAlign: "right",
                      }}
                    >
                      Design: {u.design}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
