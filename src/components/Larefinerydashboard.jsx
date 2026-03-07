/**
 * LARefineryDashboard.jsx
 * Wired to useRefineryData() — all data sourced from the mock API server.
 * Hard-coded values replaced with live state from polling hook.
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
  Settings,
  Bell,
  Sun,
  Moon,
  MapPin,
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  TrendingUp,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import useRefineryData from "../hooks/useRefineryData.jsx";

// ── THEME ──────────────────────────────────────────────────────────────────────
const T = {
  light: {
    bg: "#f3f1ee",
    bgCard: "rgba(255,255,255,0.82)",
    bgCardHover: "rgba(255,255,255,0.98)",
    bgSubtle: "rgba(0,0,0,0.03)",
    bgInset: "rgba(0,0,0,0.045)",
    border: "rgba(0,0,0,0.09)",
    headerBorder: "rgba(0,0,0,0.08)",
    textPrimary: "#161008",
    textSecondary: "#4e3d25",
    textMuted: "#7a6345",
    textDim: "#b89e7e",
    accent: "#1a538a",
    accentSoft: "rgba(26,83,138,0.09)",
    accentGlow: "rgba(26,83,138,0.2)",
    accentDark: "#0f3660",
    teal: "#0a6e8a",
    tealSoft: "rgba(10,110,138,0.09)",
    blue: "#1a4e8a",
    blueSoft: "rgba(26,78,138,0.09)",
    amber: "#9c6010",
    amberSoft: "rgba(156,96,16,0.09)",
    purple: "#6040a0",
    purpleSoft: "rgba(96,64,160,0.09)",
    good: "#1a6e48",
    warn: "#9c6010",
    bad: "#b52218",
    offline: "#8a7355",
    shadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.05)",
    toggleBg: "rgba(0,0,0,0.07)",
    grid: "rgba(0,0,0,0.055)",
    ambientA: "rgba(26,83,138,0.05)",
    ambientB: "rgba(10,110,138,0.04)",
    tabActive: "rgba(26,83,138,0.11)",
    tabText: "#1a538a",
    tabInactive: "#7a6345",
    liveRing: "rgba(26,83,138,0.2)",
    liveDot: "#1a538a",
    badgeBg: "rgba(26,83,138,0.09)",
    badgeBorder: "rgba(26,83,138,0.22)",
    skeletonBase: "rgba(0,0,0,0.06)",
    skeletonShimmer: "rgba(0,0,0,0.03)",
  },
  dark: {
    bg: "#080c12",
    bgCard: "rgba(255,255,255,0.03)",
    bgCardHover: "rgba(255,255,255,0.055)",
    bgSubtle: "rgba(255,255,255,0.025)",
    bgInset: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    headerBorder: "rgba(255,255,255,0.07)",
    textPrimary: "#dde8f2",
    textSecondary: "#7a8ea0",
    textMuted: "#4a5e72",
    textDim: "#253040",
    accent: "#4a90d8",
    accentSoft: "rgba(74,144,216,0.1)",
    accentGlow: "rgba(74,144,216,0.22)",
    accentDark: "#2a68b0",
    teal: "#22b0c8",
    tealSoft: "rgba(34,176,200,0.1)",
    blue: "#4a80c0",
    blueSoft: "rgba(74,128,192,0.1)",
    amber: "#d48820",
    amberSoft: "rgba(212,136,32,0.1)",
    purple: "#9070d8",
    purpleSoft: "rgba(144,112,216,0.1)",
    good: "#30b870",
    warn: "#d48820",
    bad: "#e84040",
    offline: "#2a3848",
    shadow: "none",
    toggleBg: "rgba(255,255,255,0.07)",
    grid: "rgba(255,255,255,0.045)",
    ambientA: "rgba(74,144,216,0.06)",
    ambientB: "rgba(34,176,200,0.05)",
    tabActive: "rgba(74,144,216,0.18)",
    tabText: "#4a90d8",
    tabInactive: "#4a5e72",
    liveRing: "rgba(74,144,216,0.25)",
    liveDot: "#4a90d8",
    badgeBg: "rgba(74,144,216,0.12)",
    badgeBorder: "rgba(74,144,216,0.28)",
    skeletonBase: "rgba(255,255,255,0.04)",
    skeletonShimmer: "rgba(255,255,255,0.02)",
  },
};

// ── SKELETON LOADER ────────────────────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = 20, r = 6, t }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: t.skeletonBase,
      animation: "shimmer 1.5s infinite",
    }}
  />
);

// ── TOOLTIP ────────────────────────────────────────────────────────────────────
const makeTooltip =
  (t) =>
  ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: t.bgCard,
          border: `1px solid ${t.accent}35`,
          borderRadius: "8px",
          padding: "10px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: t.shadow,
        }}
      >
        <p
          style={{
            color: t.accent,
            fontSize: "11px",
            fontFamily: "monospace",
            marginBottom: "6px",
          }}
        >
          {label}
        </p>
        {payload.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "2px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: p.color,
              }}
            />
            <span
              style={{
                color: t.textMuted,
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                color: t.textPrimary,
                fontSize: "11px",
                fontFamily: "monospace",
                marginLeft: "auto",
                paddingLeft: "10px",
              }}
            >
              {p.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

// ── ANIMATED VALUE — flashes when value changes ────────────────────────────────
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

// ── ARC GAUGE ──────────────────────────────────────────────────────────────────
const ArcGauge = ({ value, color, label, t }) => {
  const r = 32,
    cx = 42,
    cy = 42;
  const circ = 2 * Math.PI * r;
  const track = circ * 0.75,
    arc = track * (Math.min(value ?? 0, 100) / 100);
  const trackClr = t.bg.startsWith("#f")
    ? "rgba(0,0,0,0.08)"
    : "rgba(255,255,255,0.06)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
      }}
    >
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackClr}
          strokeWidth="7"
          strokeDasharray={`${track} ${circ - track}`}
          transform={`rotate(-135 ${cx} ${cy})`}
          strokeLinecap="round"
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
    </div>
  );
};

// ── KPI CARD ───────────────────────────────────────────────────────────────────
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
  t,
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? t.bgCardHover : t.bgCard,
        border: `1px solid ${hov ? accent + "55" : t.border}`,
        borderRadius: "12px",
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
        boxShadow: t.shadow,
        transition: "all 0.2s",
        cursor: "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "75px",
          height: "75px",
          background: `radial-gradient(circle at 100% 0%, ${accent}12 0%, transparent 70%)`,
          pointerEvents: "none",
          borderRadius: "0 12px 0 100%",
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
        </>
      )}
    </div>
  );
};

// ── CONNECTION STATUS ──────────────────────────────────────────────────────────
const ConnectionBadge = ({ error, lastUpdated, onRefresh, t }) => {
  if (error)
    return (
      <div
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
        onClick={onRefresh}
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

// ── TOGGLE ──────────────────────────────────────────────────────────────────────
const Toggle = ({ isDark, onToggle, t }) => (
  <button
    onClick={onToggle}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      padding: "5px 11px",
      borderRadius: "20px",
      border: `1px solid ${t.border}`,
      background: t.toggleBg,
      cursor: "pointer",
      color: t.textSecondary,
      fontSize: "10px",
      fontFamily: "monospace",
      transition: "all 0.2s",
    }}
  >
    <div
      style={{
        width: "28px",
        height: "16px",
        borderRadius: "8px",
        position: "relative",
        background: isDark ? t.accent : "rgba(0,0,0,0.18)",
        transition: "background 0.3s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: isDark ? "14px" : "2px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "white",
          transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </div>
    {isDark ? <Moon size={12} /> : <Sun size={12} />}
  </button>
);

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function LARefineryDashboard() {
  const [isDark, setIsDark] = useState(false);
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState("overview");

  const {
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
  } = useRefineryData();

  const t = isDark ? T.dark : T.light;
  const Tip = makeTooltip(t);
  const tk = { fill: t.textMuted, fontSize: 10, fontFamily: "monospace" };
  const tabs = ["overview", "units", "crude slate", "markets"];

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const cc = {
    crude: t.accent,
    carbGas: t.amber,
    diesel: t.blue,
    jet: t.teal,
    coke: isDark ? "#2a4535" : "#b8a888",
    other: isDark ? "#1a2e25" : "#ccc0a8",
    target: isDark ? "#1e3028" : "#c8d8c0",
  };

  // ── Derive KPI display values safely ──────────────────────────────────────
  const kv = (key) => kpis?.[key]?.value ?? "—";
  const ks = (key) => kpis?.[key]?.sub ?? "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.textPrimary,
        fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
        transition: "background 0.3s, color 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "50%",
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, ${t.ambientA} 0%, transparent 65%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background: `radial-gradient(circle, ${t.ambientB} 0%, transparent 65%)`,
            borderRadius: "50%",
          }}
        />
        <svg
          width="100%"
          height="100%"
          style={{ opacity: isDark ? 0.02 : 0.035 }}
        >
          <defs>
            <pattern
              id="g"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 44 0 L 0 0 0 44"
                fill="none"
                stroke={t.textMuted}
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 22px 28px" }}>
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 0 13px",
            borderBottom: `1px solid ${t.headerBorder}`,
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "11px",
                  flexShrink: 0,
                  background: `linear-gradient(140deg, ${t.accent}, ${t.accentDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 18px ${t.accentGlow}`,
                }}
              >
                <Flame size={22} color="white" />
              </div>
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "14px",
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
                    OPERATIONS DASHBOARD
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
                  {lastUpdated && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: t.textDim,
                        fontFamily: "monospace",
                        marginLeft: "8px",
                      }}
                    >
                      · Updated{" "}
                      {lastUpdated.toLocaleTimeString("en-US", {
                        hour12: false,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{ height: "30px", width: "1px", background: t.border }}
            />

            <div
              style={{
                display: "flex",
                gap: "2px",
                background: t.bgSubtle,
                border: `1px solid ${t.border}`,
                borderRadius: "9px",
                padding: "3px",
              }}
            >
              {tabs.map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    background: tab === tb ? t.tabActive : "transparent",
                    color: tab === tb ? t.tabText : t.tabInactive,
                    transition: "all 0.15s",
                    fontFamily: "monospace",
                  }}
                >
                  {tb}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: t.blueSoft,
                border: `1px solid ${t.blue}30`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: t.blue,
                  fontFamily: "monospace",
                  letterSpacing: "0.06em",
                }}
              >
                WEST COAST LARGEST · 365 KBPD
              </span>
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: t.accentSoft,
                border: `1px solid ${t.accent}30`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: t.accent,
                  fontFamily: "monospace",
                  letterSpacing: "0.06em",
                }}
              >
                ON-SITE COGEN 400 MW
              </span>
            </div>

            <ConnectionBadge
              error={error}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
              t={t}
            />

            <span
              style={{
                fontSize: "11px",
                color: t.textMuted,
                fontFamily: "monospace",
              }}
            >
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>

            {/* Manual refresh */}
            <button
              onClick={refresh}
              title="Force refresh all data"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: t.bgSubtle,
                border: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <RefreshCw size={13} color={t.textMuted} />
            </button>

            <Toggle
              isDark={isDark}
              onToggle={() => setIsDark((d) => !d)}
              t={t}
            />

            {[Bell, Settings].map((Icon, i) => (
              <button
                key={i}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: t.bgSubtle,
                  border: `1px solid ${t.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Icon size={14} color={t.textMuted} />
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI ROW ── */}
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
              />
            );
          })}
        </div>

        {/* ── ROW 2: Charts ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.85fr 288px",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* Throughput — streams live */}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
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
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="crude"
                    stroke={t.accent}
                    strokeWidth={2.5}
                    fill="url(#ag-crude)"
                    name="Crude"
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="carbGas"
                    stroke={t.amber}
                    strokeWidth={1.5}
                    fill="url(#ag-carbGas)"
                    name="CARB Gas"
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="carbDiesel"
                    stroke={t.blue}
                    strokeWidth={1.5}
                    fill="url(#ag-carbDiesel)"
                    name="Diesel"
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="jet"
                    stroke={t.teal}
                    strokeWidth={1.5}
                    fill="url(#ag-jet)"
                    name="Jet Fuel"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Yield */}
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
                  <Bar
                    isAnimationActive={false}
                    dataKey="carbGas"
                    stackId="a"
                    fill={t.accent}
                    name="CARB Gas %"
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="carbDiesel"
                    stackId="a"
                    fill={t.blue}
                    name="Diesel %"
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="jet"
                    stackId="a"
                    fill={t.teal}
                    name="Jet %"
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="fuelCoke"
                    stackId="a"
                    fill={cc.coke}
                    name="Fuel Coke %"
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="anodeCoke"
                    stackId="a"
                    fill={isDark ? "#3a5540" : "#a09070"}
                    name="Anode Coke %"
                  />
                  <Bar
                    isAnimationActive={false}
                    dataKey="other"
                    stackId="a"
                    fill={cc.other}
                    name="LPG/Other %"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Unit Gauges */}
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
                Online units · % design rate · updates every 8s
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
          {/* Crude Slate */}
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
                Heavy sour focus · SJV · ANS · waterborne
              </div>
            </div>
            {loading ? (
              <Skeleton w="100%" h={130} r={8} t={t} />
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
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

          {/* Throughput vs target */}
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

          {/* Crack Spread */}
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
                West Coast 3-2-1 Crack Spread
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
                $/bbl realized margin · updates every 45s
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
                          e.spread < 16
                            ? t.bad
                            : e.spread < 20
                              ? t.warn
                              : t.good
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

        {/* ── ROW 4: Units table + distro + alerts ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 240px 290px",
            gap: "12px",
          }}
        >
          {/* Process units table */}
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
                  Process Units — Live Status
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
                  °C · barg · % design rate · updates every 8s
                </div>
              </div>
              <div style={{ display: "flex", gap: "7px" }}>
                {[
                  ["NORTH PLANT", t.accent],
                  ["SOUTH PLANT", t.blue],
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
                    {s}
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
                  const rowBg =
                    u.status === "warning"
                      ? isDark
                        ? "rgba(212,136,32,0.06)"
                        : "rgba(156,96,16,0.05)"
                      : u.status === "offline"
                        ? t.bgInset
                        : t.bgSubtle;
                  return (
                    <div
                      key={u.name}
                      style={{
                        padding: "9px 11px",
                        borderRadius: "8px",
                        background: rowBg,
                        border: `1px solid ${u.status === "warning" ? t.warn + "30" : t.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        transition: "background 0.3s, border-color 0.3s",
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
                              flexShrink: 0,
                              boxShadow:
                                u.status !== "offline"
                                  ? `0 0 5px ${sc}`
                                  : "none",
                              transition: "background 0.3s",
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
                              boxShadow: `0 0 4px ${sc}55`,
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
                Crude imports via marine terminal — Port of Los Angeles / Long
                Beach
              </span>
            </div>
            <div
              style={{
                marginTop: "8px",
                padding: "7px 9px",
                borderRadius: "7px",
                background: t.accentSoft,
                border: `1px solid ${t.accent}25`,
                fontSize: "8px",
                color: t.textSecondary,
                fontFamily: "monospace",
                lineHeight: 1.5,
              }}
            >
              Pipeline-connected terminals serve CA, NV, and AZ markets
            </div>
          </div>

          {/* Alerts — auto-generated from threshold breaches */}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
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
                  auto · 6s
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
                        style={{
                          padding: "8px 10px",
                          borderRadius: "7px",
                          background: ab,
                          border: `1px solid ${ac}28`,
                          animation: "fadeIn 0.3s ease",
                        }}
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
                Regulator: South Coast AQMD · CARB Phase 3<br />
                Cogen: 400 MW nameplate (largest in CA)
                <br />
                Crude: SJV pipeline + ANS + waterborne intl.
                <br />
                Capacity: 365,000 bpcd · ~1,450 employees
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes lp       { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; } button:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,83,138,0.25); border-radius: 4px; }
      `}</style>
    </div>
  );
}
