/**
 * Overview.jsx
 * The main refinery dashboard — refactored from LARefineryDashboard.jsx.
 * No longer owns theme or data fetching — receives everything as props from AppShell.
 * Exposes click callbacks: onKpiClick, onUnitClick, onAlertClick.
 */

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Droplets,
  Flame,
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  MapPin,
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  TrendingUp,
  RefreshCw,
  WifiOff,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import { makeTooltip, tickStyle, Skeleton } from "../shared/Theme";

// ── ANIMATED VALUE ─────────────────────────────────────────────────────────────
const AnimatedValue = ({ value, t }) => {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      prev.current = value;
      const id = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(id);
    }
  }, [value]);
  return (
    <span
      style={{
        color: flash ? t.accent : t.textPrimary,
        fontSize: "24px",
        fontFamily: "monospace",
        fontWeight: 700,
        lineHeight: 1,
        transition: "color 0.4s ease",
      }}
    >
      {value}
    </span>
  );
};

// ── ARC GAUGE — clickable ──────────────────────────────────────────────────────
const ArcGauge = ({ value, color, label, t, onClick }) => {
  const r = 32,
    cx = 42,
    cy = 42;
  const circ = 2 * Math.PI * r;
  const track = circ * 0.75,
    arc = track * (Math.min(value ?? 0, 100) / 100);
  const trackClr = t.bg.startsWith("#f")
    ? "rgba(0,0,0,0.08)"
    : "rgba(255,255,255,0.06)";
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`Click to drill into ${label}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        cursor: onClick ? "pointer" : "default",
        opacity: hov ? 0.8 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={hov ? color : trackClr}
          strokeWidth="7"
          strokeDasharray={`${track} ${circ - track}`}
          transform={`rotate(-135 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ transition: "stroke 0.2s" }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${arc} ${circ - arc}`}
          transform={`rotate(-135 ${cx} ${cy})`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color}65)`,
            transition: "stroke-dasharray 0.8s ease",
          }}
        />
        <text
          x={cx}
          y={cx - 2}
          textAnchor="middle"
          fill={t.textPrimary}
          style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: 700 }}
        >
          {value ?? "—"}
        </text>
        <text
          x={cx}
          y={cx + 11}
          textAnchor="middle"
          fill={t.textMuted}
          style={{ fontSize: "8px", fontFamily: "monospace" }}
        >
          %
        </text>
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span
          style={{
            color: t.textMuted,
            fontSize: "9px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
        {onClick && <ChevronRight size={8} color={t.textDim} />}
      </div>
    </div>
  );
};

// ── KPI CARD — clickable ───────────────────────────────────────────────────────
const KPICard = ({
  label,
  value,
  unit,
  sub,
  delta,
  deltaPos,
  icon: Icon,
  accent,
  soft,
  loading,
  onClick,
  t,
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Click to expand trend"
      style={{
        background: hov ? t.bgCardHover : t.bgCard,
        border: `1px solid ${hov ? accent + "70" : t.border}`,
        borderRadius: "12px",
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
        boxShadow: hov ? t.shadowLg : t.shadow,
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      {/* Glow corner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "75px",
          height: "75px",
          background: `radial-gradient(circle at 100% 0%, ${accent}${hov ? "22" : "12"} 0%, transparent 70%)`,
          pointerEvents: "none",
          borderRadius: "0 12px 0 100%",
          transition: "background 0.2s",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "9px",
        }}
      >
        <span
          style={{
            color: t.textMuted,
            fontSize: "10px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
        <div style={{ padding: "5px", borderRadius: "7px", background: soft }}>
          <Icon size={13} color={accent} />
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton w="70%" h={28} t={t} />
          <Skeleton w="50%" h={12} t={t} />
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "5px",
              marginBottom: "4px",
            }}
          >
            <AnimatedValue value={value} t={t} />
            <span
              style={{
                color: t.textMuted,
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              {unit}
            </span>
          </div>
          {sub && (
            <div
              style={{
                fontSize: "9px",
                color: t.textDim,
                fontFamily: "monospace",
                marginBottom: "4px",
              }}
            >
              {sub}
            </div>
          )}
          {delta && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {deltaPos ? (
                <ArrowUpRight size={11} color={t.good} />
              ) : (
                <ArrowDownRight size={11} color={t.bad} />
              )}
              <span
                style={{
                  color: deltaPos ? t.good : t.bad,
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
              >
                {delta}
              </span>
            </div>
          )}
          {hov && (
            <div
              style={{
                marginTop: "6px",
                fontSize: "8px",
                color: t.accent,
                fontFamily: "monospace",
                letterSpacing: "0.06em",
              }}
            >
              CLICK TO EXPAND →
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── CONNECTION BADGE ───────────────────────────────────────────────────────────
const ConnectionBadge = ({ error, onRefresh, t }) => {
  if (error)
    return (
      <div
        onClick={onRefresh}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(181,34,24,0.1)",
          border: "1px solid rgba(181,34,24,0.25)",
          borderRadius: "20px",
          padding: "4px 11px",
          cursor: "pointer",
        }}
      >
        <WifiOff size={10} color={t.bad} />
        <span
          style={{ fontSize: "9px", color: t.bad, fontFamily: "monospace" }}
        >
          API OFFLINE
        </span>
      </div>
    );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: t.accentSoft,
        border: `1px solid ${t.liveRing}`,
        borderRadius: "20px",
        padding: "4px 11px",
      }}
    >
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: t.liveDot,
          boxShadow: `0 0 7px ${t.liveDot}`,
          animation: "lp 2s infinite",
        }}
      />
      <span
        style={{
          fontSize: "9px",
          color: t.liveDot,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
        }}
      >
        LIVE
      </span>
    </div>
  );
};

// ── MAIN OVERVIEW ──────────────────────────────────────────────────────────────
export default function Overview({
  kpis,
  throughput,
  yieldData,
  units,
  alerts,
  crudeSlate,
  margins,
  production,
  loading,
  error,
  lastUpdated,
  getDelta,
  refresh,
  isDark,
  t,
  onKpiClick,
  onUnitClick,
  onAlertClick,
}) {
  // Props might be serialized through SSR and come back as strings.
  // Ensure we always work with a Date object when formatting.
  const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const Tip = makeTooltip(t);
  const tk = tickStyle(t);

  const cc = {
    crude: t.accent,
    carbGas: t.amber,
    diesel: t.blue,
    jet: t.teal,
    coke: isDark ? "#2a4535" : "#b8a888",
    other: isDark ? "#1a2e25" : "#ccc0a8",
    target: isDark ? "#1e3028" : "#c8d8c0",
  };

  const kv = (key) => kpis?.[key]?.value ?? "—";
  const ks = (key) => kpis?.[key]?.sub ?? "";

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "0 22px 28px" }}>
      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 0 13px",
          borderBottom: `1px solid ${t.headerBorder}`,
          marginBottom: "16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                flexShrink: 0,
                background: `linear-gradient(140deg, ${t.accent}, ${t.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 16px ${t.accentGlow}`,
              }}
            >
              <Flame size={19} color="white" />
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: t.textPrimary,
                    letterSpacing: "0.04em",
                  }}
                >
                  LOS ANGELES REFINERY
                </span>
                <span style={{ fontSize: "10px", color: t.textDim }}>|</span>
                <span
                  style={{
                    fontSize: "11px",
                    color: t.accent,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  OVERVIEW
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "2px",
                }}
              >
                <MapPin size={9} color={t.textMuted} />
                <span
                  style={{
                    fontSize: "9px",
                    color: t.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  North Plant · Carson, CA &amp; South Plant · Wilmington, CA
                </span>
                {lastUpdatedDate && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: t.textDim,
                      fontFamily: "monospace",
                      marginLeft: "6px",
                    }}
                  >
                    · Updated{" "}
                    {lastUpdatedDate.toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                padding: "3px 9px",
                borderRadius: "5px",
                background: t.blueSoft,
                border: `1px solid ${t.blue}28`,
                fontSize: "9px",
                color: t.blue,
                fontFamily: "monospace",
              }}
            >
              365 KBPD
            </div>
            <div
              style={{
                padding: "3px 9px",
                borderRadius: "5px",
                background: t.accentSoft,
                border: `1px solid ${t.accent}28`,
                fontSize: "9px",
                color: t.accent,
                fontFamily: "monospace",
              }}
            >
              COGEN 400 MW
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ConnectionBadge error={error} onRefresh={refresh} t={t} />
          <span
            suppressHydrationWarning
            style={{
              fontSize: "11px",
              color: t.textMuted,
              fontFamily: "monospace",
            }}
          >
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <button
            onClick={refresh}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "7px",
              background: t.bgSubtle,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} color={t.textMuted} />
          </button>
          <button
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "7px",
              background: t.bgSubtle,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Bell size={12} color={t.textMuted} />
          </button>
        </div>
      </div>

      {/* ── KPI ROW — each card opens modal on click ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "11px",
          marginBottom: "14px",
        }}
      >
        {[
          {
            key: "crudeThroughput",
            label: "Crude Throughput",
            unit: "MBPD",
            icon: Droplets,
            accent: t.accent,
            soft: t.accentSoft,
          },
          {
            key: "carbGasoline",
            label: "CARB Gasoline",
            unit: "MBPD",
            icon: Activity,
            accent: t.amber,
            soft: t.amberSoft,
          },
          {
            key: "carbDiesel",
            label: "CARB Diesel",
            unit: "MBPD",
            icon: Zap,
            accent: t.blue,
            soft: t.blueSoft,
          },
          {
            key: "jetFuel",
            label: "Jet Fuel",
            unit: "MBPD",
            icon: Wind,
            accent: t.teal,
            soft: t.tealSoft,
          },
          {
            key: "cogenOutput",
            label: "Cogen Output",
            unit: "MW",
            icon: TrendingUp,
            accent: t.accent,
            soft: t.accentSoft,
          },
          {
            key: "crackSpread",
            label: "WC Crack Spread",
            unit: "$/bbl",
            icon: Gauge,
            accent: t.purple,
            soft: t.purpleSoft,
          },
        ].map(({ key, label, unit, icon, accent, soft }) => {
          const { delta, deltaPos } = getDelta(key);
          return (
            <KPICard
              key={key}
              label={label}
              value={kv(key)}
              unit={unit}
              sub={ks(key)}
              delta={delta}
              deltaPos={deltaPos}
              icon={icon}
              accent={accent}
              soft={soft}
              loading={loading}
              t={t}
              onClick={() => onKpiClick(key)}
            />
          );
        })}
      </div>

      {/* ── ROW 2 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.85fr 288px",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        {/* Throughput chart */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: t.textPrimary,
                  fontWeight: 600,
                }}
              >
                Live Throughput — Rolling Window
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "2px",
                }}
              >
                North + South plants combined · MBPD · updates every 10s
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                ["Crude", t.accent],
                ["CARB Gas", t.amber],
                ["Diesel", t.blue],
                ["Jet", t.teal],
              ].map(([l, c]) => (
                <div
                  key={l}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "2px",
                      background: c,
                      borderRadius: "2px",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "9px",
                      color: t.textMuted,
                      fontFamily: "monospace",
                    }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <Skeleton w="100%" h={196} r={8} t={t} />
          ) : (
            <ResponsiveContainer width="100%" height={196}>
              <AreaChart
                data={throughput}
                margin={{ top: 0, right: 0, bottom: 0, left: -16 }}
              >
                <defs>
                  {[
                    ["crude", t.accent],
                    ["carbGas", t.amber],
                    ["carbDiesel", t.blue],
                    ["jet", t.teal],
                  ].map(([k, c]) => (
                    <linearGradient
                      key={k}
                      id={`ag-${k}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={c}
                        stopOpacity={isDark ? 0.2 : 0.14}
                      />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                  dataKey="time"
                  tick={tk}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={tk} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <ReferenceLine
                  y={365}
                  stroke={t.accent}
                  strokeDasharray="5 4"
                  strokeOpacity={0.3}
                  label={{
                    value: "365k cap",
                    fill: t.accent,
                    fontSize: 8,
                    fontFamily: "monospace",
                  }}
                />
                {[
                  ["crude", t.accent, 2.5],
                  ["carbGas", t.amber, 1.5],
                  ["carbDiesel", t.blue, 1.5],
                  ["jet", t.teal, 1.5],
                ].map(([k, c, w]) => (
                  <Area
                    key={k}
                    isAnimationActive={false}
                    type="monotone"
                    dataKey={k}
                    stroke={c}
                    strokeWidth={w}
                    fill={`url(#ag-${k})`}
                    name={k}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Yield chart */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Product Yield Mix
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "2px",
              }}
            >
              7-Day · % of crude feed
            </div>
          </div>
          {loading ? (
            <Skeleton w="100%" h={196} r={8} t={t} />
          ) : (
            <ResponsiveContainer width="100%" height={196}>
              <BarChart
                data={yieldData}
                margin={{ top: 0, right: 0, bottom: 0, left: -22 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                  dataKey="day"
                  tick={tk}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={tk}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<Tip />} />
                {[
                  ["carbGas", t.accent, "CARB Gas %"],
                  ["carbDiesel", t.blue, "Diesel %"],
                  ["jet", t.teal, "Jet %"],
                  ["fuelCoke", isDark ? "#2a4535" : "#b8a888", "Fuel Coke %"],
                  ["anodeCoke", isDark ? "#3a5540" : "#a09070", "Anode Coke %"],
                  ["other", isDark ? "#1a2e25" : "#ccc0a8", "LPG/Other %"],
                ].map(([key, fill, name], i, arr) => (
                  <Bar
                    key={key}
                    isAnimationActive={false}
                    dataKey={key}
                    stackId="a"
                    fill={fill}
                    name={name}
                    radius={i === arr.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Unit gauges — each clickable */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Unit Utilization
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "2px",
              }}
            >
              Click any gauge to drill in · updates 8s
            </div>
          </div>
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "4px",
              }}
            >
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} w="84px" h={84} r={8} t={t} />
                ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "4px",
              }}
            >
              {units
                .filter((u) => u.status !== "offline")
                .slice(0, 9)
                .map((u) => (
                  <ArcGauge
                    key={u.name}
                    value={u.load}
                    t={t}
                    color={
                      u.status === "warning"
                        ? t.warn
                        : u.load > 90
                          ? t.accent
                          : t.teal
                    }
                    label={u.name}
                    onClick={() => onUnitClick(u.name)}
                  />
                ))}
            </div>
          )}
          {units.find((u) => u.status === "offline") && (
            <div
              style={{
                marginTop: "10px",
                padding: "7px 10px",
                borderRadius: "7px",
                background: isDark
                  ? "rgba(212,136,32,0.07)"
                  : "rgba(156,96,16,0.06)",
                border: `1px solid ${t.warn}28`,
                display: "flex",
                gap: "6px",
              }}
            >
              <AlertTriangle
                size={10}
                color={t.warn}
                style={{ marginTop: "1px", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: t.warn,
                  fontFamily: "monospace",
                  lineHeight: 1.5,
                }}
              >
                {units
                  .filter((u) => u.status === "offline")
                  .map((u) => u.name)
                  .join(", ")}{" "}
                — offline / turnaround
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        {/* Crude slate donut */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Crude Slate
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "2px",
              }}
            >
              Heavy sour · SJV · ANS · waterborne
            </div>
          </div>
          {loading ? (
            <Skeleton w="100%" h={130} r={8} t={t} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
                    data={crudeSlate}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={60}
                    dataKey="pct"
                    paddingAngle={2}
                  >
                    {crudeSlate.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div
                          style={{
                            background: t.bgCard,
                            border: `1px solid ${t.border}`,
                            borderRadius: "6px",
                            padding: "6px 10px",
                            boxShadow: t.shadow,
                          }}
                        >
                          <span
                            style={{
                              color: t.textPrimary,
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                          >
                            {payload[0].payload.name}: {payload[0].value}%
                          </span>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {crudeSlate.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "2px",
                        background: e.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "9px",
                        color: t.textSecondary,
                        fontFamily: "monospace",
                        flex: 1,
                      }}
                    >
                      {e.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: t.textPrimary,
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      {e.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly throughput */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Throughput vs. Design
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "2px",
              }}
            >
              8-Month · MBPD · 365 MBPD design cap
            </div>
          </div>
          {loading ? (
            <Skeleton w="100%" h={160} r={8} t={t} />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={production}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                  dataKey="month"
                  tick={{ ...tk, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={tk}
                  axisLine={false}
                  tickLine={false}
                  domain={[280, 380]}
                />
                <Tooltip content={<Tip />} />
                <ReferenceLine
                  y={365}
                  stroke={t.accent}
                  strokeDasharray="5 4"
                  strokeOpacity={0.4}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="target"
                  stroke={cc.target}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Design Cap"
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="actual"
                  stroke={t.accent}
                  strokeWidth={2.5}
                  dot={{ fill: t.accent, strokeWidth: 0, r: 3.5 }}
                  activeDot={{ r: 5 }}
                  name="Actual MBPD"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Crack spread */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              WC Crack Spread
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "2px",
              }}
            >
              $/bbl realized · updates every 45s
            </div>
          </div>
          {loading ? (
            <Skeleton w="100%" h={120} r={8} t={t} />
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={margins}
                margin={{ top: 0, right: 4, bottom: 0, left: -18 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                  dataKey="mo"
                  tick={{ ...tk, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={tk} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <ReferenceLine
                  y={16}
                  stroke={t.warn}
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="spread"
                  name="$/bbl"
                  radius={[3, 3, 0, 0]}
                >
                  {margins.map((e, i) => (
                    <Cell
                      key={i}
                      fill={
                        e.spread < 16 ? t.bad : e.spread < 20 ? t.warn : t.good
                      }
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 4 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px 290px",
          gap: "12px",
        }}
      >
        {/* Unit status table */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: t.textPrimary,
                  fontWeight: 600,
                }}
              >
                Process Units — Live
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginTop: "2px",
                }}
              >
                °C · barg · % design · click to drill in
              </div>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              {[
                ["NORTH", t.accent],
                ["SOUTH", t.blue],
              ].map(([s, c]) => (
                <div
                  key={s}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "5px",
                    background: `${c}14`,
                    border: `1px solid ${c}28`,
                    fontSize: "8px",
                    color: c,
                    fontFamily: "monospace",
                  }}
                >
                  {s} PLANT
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px",
              }}
            >
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} w="100%" h={72} r={8} t={t} />
                ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px",
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
                    onClick={() =>
                      u.status !== "offline" && onUnitClick(u.name)
                    }
                    style={{
                      padding: "9px 11px",
                      borderRadius: "8px",
                      cursor: u.status !== "offline" ? "pointer" : "default",
                      background:
                        u.status === "warning"
                          ? isDark
                            ? "rgba(212,136,32,0.06)"
                            : "rgba(156,96,16,0.05)"
                          : u.status === "offline"
                            ? t.bgInset
                            : t.bgSubtle,
                      border: `1px solid ${u.status === "warning" ? t.warn + "30" : t.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (u.status !== "offline") {
                        e.currentTarget.style.borderColor = t.accent + "50";
                        e.currentTarget.style.background = t.bgCardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        u.status === "warning" ? t.warn + "30" : t.border;
                      e.currentTarget.style.background =
                        u.status === "warning"
                          ? isDark
                            ? "rgba(212,136,32,0.06)"
                            : "rgba(156,96,16,0.05)"
                          : u.status === "offline"
                            ? t.bgInset
                            : t.bgSubtle;
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: sc,
                            boxShadow:
                              u.status !== "offline" ? `0 0 5px ${sc}` : "none",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "11px",
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
                          gap: "5px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "7px",
                            color: siteColor,
                            fontFamily: "monospace",
                            background: `${siteColor}15`,
                            padding: "1px 5px",
                            borderRadius: "3px",
                          }}
                        >
                          {u.site}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color:
                              u.status === "offline"
                                ? t.textDim
                                : t.textPrimary,
                            fontFamily: "monospace",
                          }}
                        >
                          {u.status === "offline" ? "—" : `${u.load}%`}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        color: t.textMuted,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {u.product}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "9px",
                            color: t.textSecondary,
                            fontFamily: "monospace",
                          }}
                        >
                          {u.temp}°C
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            color: t.textSecondary,
                            fontFamily: "monospace",
                          }}
                        >
                          {u.pressure > 0
                            ? `${u.pressure} barg`
                            : "depressurized"}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "8px",
                          color: t.textDim,
                          fontFamily: "monospace",
                        }}
                      >
                        {u.design}
                      </span>
                    </div>
                    {u.status !== "offline" && (
                      <div
                        style={{
                          height: "3px",
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
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Distribution */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Product Distribution
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginTop: "2px",
              }}
            >
              Branded retail + pipeline + marine
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "11px" }}
          >
            {[
              { channel: "Branded Retail (CA/West)", pct: 44 },
              { channel: "Wholesale / Unbranded", pct: 21 },
              { channel: "LAX Jet Pipeline", pct: 13 },
              { channel: "NV / AZ Pipeline", pct: 12 },
              { channel: "Marine Terminal", pct: 6 },
              { channel: "Coke Rail / Port", pct: 4 },
            ].map((d, i) => {
              const clrs = [
                t.accent,
                t.blue,
                t.teal,
                t.amber,
                isDark ? "#5a7a68" : "#8a9a78",
                isDark ? "#4a5a5a" : "#a09080",
              ];
              return (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: t.textSecondary,
                        fontFamily: "monospace",
                      }}
                    >
                      {d.channel}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: t.textPrimary,
                        fontFamily: "monospace",
                        fontWeight: 600,
                      }}
                    >
                      {d.pct}%
                    </span>
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
                        width: `${d.pct}%`,
                        borderRadius: "2px",
                        background: clrs[i],
                        boxShadow: `0 0 4px ${clrs[i]}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: "14px",
              padding: "7px 9px",
              borderRadius: "7px",
              background: t.tealSoft,
              border: `1px solid ${t.teal}25`,
              display: "flex",
              gap: "6px",
              alignItems: "flex-start",
            }}
          >
            <Ship
              size={10}
              color={t.teal}
              style={{ marginTop: "1px", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "8px",
                color: t.teal,
                fontFamily: "monospace",
                lineHeight: 1.5,
              }}
            >
              Crude imports via marine terminal — Port of LA / Long Beach
            </span>
          </div>
        </div>

        {/* Alerts — click to jump */}
        <div
          style={{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: "12px",
            padding: "18px",
            boxShadow: t.shadow,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: t.textPrimary,
                fontWeight: 600,
              }}
            >
              Operational Alerts
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  fontSize: "9px",
                  background: t.badgeBg,
                  color: t.accent,
                  border: `1px solid ${t.badgeBorder}`,
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontFamily: "monospace",
                }}
              >
                {alerts.length} active
              </div>
              <span
                style={{
                  fontSize: "8px",
                  color: t.textDim,
                  fontFamily: "monospace",
                }}
              >
                click to jump
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} w="100%" h={52} r={7} t={t} />
                  ))
              : alerts.map((a) => {
                  const ac =
                    a.level === "warn"
                      ? t.warn
                      : a.level === "good"
                        ? t.good
                        : t.blue;
                  const ab =
                    a.level === "warn"
                      ? isDark
                        ? "rgba(212,136,32,0.07)"
                        : "rgba(156,96,16,0.06)"
                      : a.level === "good"
                        ? isDark
                          ? "rgba(48,184,112,0.07)"
                          : "rgba(26,110,72,0.06)"
                        : t.bgSubtle;
                  const Ico =
                    a.level === "warn"
                      ? AlertTriangle
                      : a.level === "good"
                        ? CheckCircle
                        : Clock;
                  return (
                    <div
                      key={a.id}
                      onClick={() => onAlertClick(a.unit)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "7px",
                        background: ab,
                        border: `1px solid ${ac}28`,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                        animation: "fadeIn 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "2px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Ico size={10} color={ac} />
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: ac,
                              fontFamily: "monospace",
                            }}
                          >
                            {a.unit}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "8px",
                            color: t.textDim,
                            fontFamily: "monospace",
                          }}
                        >
                          {a.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: t.textSecondary,
                          lineHeight: 1.5,
                          fontFamily: "monospace",
                        }}
                      >
                        {a.msg}
                      </div>
                    </div>
                  );
                })}
          </div>
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: t.textDim,
                fontFamily: "monospace",
                lineHeight: 1.7,
              }}
            >
              ℹ Alerts auto-generated from threshold rules
              <br />
              South Coast AQMD · CARB Phase 3 in effect
              <br />
              Cogen 400 MW · SJV + ANS + waterborne crude
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
