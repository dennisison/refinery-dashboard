import { useState, useEffect } from "react";
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
} from "recharts";
import {
  AlertTriangle,
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
} from "lucide-react";

// ── THEME TOKENS ───────────────────────────────────────────────────────────────
const themes = {
  light: {
    bg: "#f4f1ec",
    bgCard: "rgba(255,255,255,0.75)",
    bgCardHover: "rgba(255,255,255,0.95)",
    bgSubtle: "rgba(0,0,0,0.03)",
    border: "rgba(0,0,0,0.08)",
    borderAccent: "rgba(194,73,24,0.3)",
    gridLine: "rgba(0,0,0,0.06)",
    textPrimary: "#1a1208",
    textSecondary: "#6b5c45",
    textMuted: "#a8937a",
    textDim: "#c4b49e",
    accent: "#c24918",
    accentGlow: "rgba(194,73,24,0.15)",
    accentSoft: "rgba(194,73,24,0.08)",
    teal: "#1a7a6e",
    tealGlow: "rgba(26,122,110,0.15)",
    blue: "#2c5f8a",
    blueGlow: "rgba(44,95,138,0.15)",
    amber: "#b5621a",
    amberGlow: "rgba(181,98,26,0.15)",
    good: "#1a7a6e",
    warn: "#b5621a",
    bad: "#b52a1a",
    offline: "#8a7a6a",
    shadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
    shadowCard: "0 2px 8px rgba(0,0,0,0.08)",
    toggleBg: "rgba(0,0,0,0.06)",
    headerBorder: "rgba(0,0,0,0.08)",
    ambientA: "rgba(194,73,24,0.06)",
    ambientB: "rgba(44,95,138,0.05)",
    gridPattern: "#8a7a6a",
    tabActive: "rgba(194,73,24,0.12)",
    tabText: "#c24918",
    tabInactive: "#a8937a",
    liveRing: "rgba(26,122,110,0.2)",
    liveDot: "#1a7a6e",
    statDelta: "#e8f5f3",
    badgeBg: "rgba(194,73,24,0.1)",
    badgeBorder: "rgba(194,73,24,0.2)",
  },
  dark: {
    bg: "#060912",
    bgCard: "rgba(255,255,255,0.025)",
    bgCardHover: "rgba(255,255,255,0.04)",
    bgSubtle: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.07)",
    borderAccent: "rgba(232,97,42,0.3)",
    gridLine: "rgba(255,255,255,0.04)",
    textPrimary: "#dde6f0",
    textSecondary: "#8899aa",
    textMuted: "#556677",
    textDim: "#334455",
    accent: "#e8612a",
    accentGlow: "rgba(232,97,42,0.18)",
    accentSoft: "rgba(232,97,42,0.08)",
    teal: "#2a9d8f",
    tealGlow: "rgba(42,157,143,0.18)",
    blue: "#457b9d",
    blueGlow: "rgba(69,123,157,0.18)",
    amber: "#f4a261",
    amberGlow: "rgba(244,162,97,0.18)",
    good: "#2a9d8f",
    warn: "#f4a261",
    bad: "#e63946",
    offline: "#334455",
    shadow: "none",
    shadowCard: "none",
    toggleBg: "rgba(255,255,255,0.06)",
    headerBorder: "rgba(255,255,255,0.06)",
    ambientA: "rgba(232,97,42,0.05)",
    ambientB: "rgba(69,123,157,0.06)",
    gridPattern: "#8899aa",
    tabActive: "rgba(232,97,42,0.2)",
    tabText: "#e8612a",
    tabInactive: "#556677",
    liveRing: "rgba(42,157,143,0.25)",
    liveDot: "#2a9d8f",
    statDelta: "transparent",
    badgeBg: "rgba(232,97,42,0.15)",
    badgeBorder: "rgba(232,97,42,0.25)",
  },
};

// ── DATA ───────────────────────────────────────────────────────────────────────
const throughputData = [
  { time: "00:00", crude: 412, gasoline: 198, diesel: 156, jet: 84 },
  { time: "02:00", crude: 418, gasoline: 201, diesel: 159, jet: 86 },
  { time: "04:00", crude: 408, gasoline: 195, diesel: 153, jet: 82 },
  { time: "06:00", crude: 425, gasoline: 207, diesel: 164, jet: 89 },
  { time: "08:00", crude: 441, gasoline: 218, diesel: 171, jet: 93 },
  { time: "10:00", crude: 458, gasoline: 226, diesel: 178, jet: 97 },
  { time: "12:00", crude: 462, gasoline: 229, diesel: 181, jet: 98 },
  { time: "14:00", crude: 455, gasoline: 224, diesel: 176, jet: 95 },
  { time: "16:00", crude: 447, gasoline: 219, diesel: 172, jet: 93 },
  { time: "18:00", crude: 438, gasoline: 213, diesel: 168, jet: 91 },
  { time: "20:00", crude: 431, gasoline: 209, diesel: 165, jet: 89 },
  { time: "22:00", crude: 424, gasoline: 205, diesel: 161, jet: 87 },
];

const weeklyYield = [
  { day: "Mon", gasoline: 43.2, diesel: 33.8, jet: 18.4, residual: 4.6 },
  { day: "Tue", gasoline: 44.1, diesel: 34.2, jet: 17.9, residual: 3.8 },
  { day: "Wed", gasoline: 42.8, diesel: 35.1, jet: 18.8, residual: 3.3 },
  { day: "Thu", gasoline: 45.3, diesel: 33.5, jet: 17.6, residual: 3.6 },
  { day: "Fri", gasoline: 44.7, diesel: 34.8, jet: 18.1, residual: 2.4 },
  { day: "Sat", gasoline: 43.9, diesel: 34.1, jet: 18.5, residual: 3.5 },
  { day: "Sun", gasoline: 44.4, diesel: 33.9, jet: 18.2, residual: 3.5 },
];

const unitStatus = [
  {
    name: "CDU-1",
    load: 94,
    temp: 368,
    pressure: 142,
    status: "optimal",
    product: "Atmospheric Distillation",
  },
  {
    name: "VDU-2",
    load: 87,
    temp: 412,
    pressure: 18,
    status: "optimal",
    product: "Vacuum Distillation",
  },
  {
    name: "FCC-1",
    load: 91,
    temp: 524,
    pressure: 28,
    status: "warning",
    product: "Fluid Cat Cracking",
  },
  {
    name: "HDS-3",
    load: 78,
    temp: 356,
    pressure: 68,
    status: "optimal",
    product: "Hydrodesulfurization",
  },
  {
    name: "RFM-2",
    load: 96,
    temp: 497,
    pressure: 22,
    status: "optimal",
    product: "Catalytic Reforming",
  },
  {
    name: "ALK-1",
    load: 65,
    temp: 12,
    pressure: 89,
    status: "offline",
    product: "Alkylation Unit",
  },
];

const monthlyProd = [
  { month: "Aug", target: 13500, actual: 13210 },
  { month: "Sep", target: 13800, actual: 13750 },
  { month: "Oct", target: 14000, actual: 14180 },
  { month: "Nov", target: 13600, actual: 13420 },
  { month: "Dec", target: 13200, actual: 12980 },
  { month: "Jan", target: 13900, actual: 14050 },
  { month: "Feb", target: 14200, actual: 14310 },
  { month: "Mar", target: 14500, actual: 14280 },
];

const sulfurTrend = [
  { time: "W-8", ppm: 12.4 },
  { time: "W-7", ppm: 11.8 },
  { time: "W-6", ppm: 13.1 },
  { time: "W-5", ppm: 10.9 },
  { time: "W-4", ppm: 9.7 },
  { time: "W-3", ppm: 8.4 },
  { time: "W-2", ppm: 7.9 },
  { time: "W-1", ppm: 7.2 },
  { time: "Now", ppm: 6.8 },
];

const alerts = [
  {
    id: 1,
    unit: "FCC-1",
    msg: "Regenerator temp approaching limit",
    level: "warn",
    time: "4m ago",
  },
  {
    id: 2,
    unit: "ALK-1",
    msg: "Scheduled maintenance — offline",
    level: "info",
    time: "2h ago",
  },
  {
    id: 3,
    unit: "CDU-1",
    msg: "Crude feed rate optimized +2.3%",
    level: "good",
    time: "3h ago",
  },
];

// ── TOOLTIP ────────────────────────────────────────────────────────────────────
const makeTooltip =
  (t) =>
  ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: t.bgCard,
          border: `1px solid ${t.borderAccent}`,
          borderRadius: "8px",
          padding: "10px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: t.shadowCard,
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
                paddingLeft: "12px",
              }}
            >
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

// ── GAUGE ──────────────────────────────────────────────────────────────────────
const GaugeRing = ({ value, color, label, t }) => {
  const r = 38,
    cx = 52,
    cy = 52;
  const circumference = 2 * Math.PI * r;
  const arc = (value / 100) * circumference * 0.75;
  const rotation = -135;
  const trackColor =
    t.bg === themes.light.bg ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${arc} ${circumference - arc}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 5px ${color}80)`,
            transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={t.textPrimary}
          style={{ fontSize: "18px", fontFamily: "monospace", fontWeight: 700 }}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill={t.textMuted}
          style={{ fontSize: "9px", fontFamily: "monospace" }}
        >
          %
        </text>
      </svg>
      <span
        style={{
          color: t.textMuted,
          fontSize: "10px",
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── STAT CARD ──────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  unit,
  delta,
  deltaPos,
  icon: Icon,
  accent,
  accentSoft,
  t,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? t.bgCardHover : t.bgCard,
        border: `1px solid ${hovered ? accent + "40" : t.border}`,
        borderRadius: "12px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: t.shadowCard,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "90px",
          height: "90px",
          background: `radial-gradient(circle at 100% 0%, ${accent}14 0%, transparent 70%)`,
          borderRadius: "0 12px 0 100%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            color: t.textMuted,
            fontSize: "11px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
        <div
          style={{
            padding: "6px",
            borderRadius: "8px",
            background: accentSoft,
          }}
        >
          <Icon size={14} color={accent} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            color: t.textPrimary,
            fontSize: "28px",
            fontFamily: "monospace",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span
          style={{
            color: t.textMuted,
            fontSize: "13px",
            fontFamily: "monospace",
          }}
        >
          {unit}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {deltaPos ? (
          <ArrowUpRight size={12} color={t.good} />
        ) : (
          <ArrowDownRight size={12} color={t.bad} />
        )}
        <span
          style={{
            color: deltaPos ? t.good : t.bad,
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          {delta}
        </span>
        <span
          style={{
            color: t.textDim,
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          &nbsp;vs. yesterday
        </span>
      </div>
    </div>
  );
};

// ── THEME TOGGLE ───────────────────────────────────────────────────────────────
const ThemeToggle = ({ isDark, onToggle, t }) => (
  <button
    onClick={onToggle}
    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 12px",
      borderRadius: "20px",
      border: `1px solid ${t.border}`,
      background: t.toggleBg,
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: t.textSecondary,
      fontSize: "11px",
      fontFamily: "monospace",
      letterSpacing: "0.06em",
    }}
  >
    <div
      style={{
        width: "32px",
        height: "18px",
        borderRadius: "9px",
        background: isDark ? t.accent : "rgba(0,0,0,0.15)",
        position: "relative",
        transition: "background 0.3s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: isDark ? "17px" : "3px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "white",
          transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
    {isDark ? <Moon size={13} /> : <Sun size={13} />}
    <span>{isDark ? "Dark" : "Light"}</span>
  </button>
);

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function RefineryDashboard() {
  const [isDark, setIsDark] = useState(false); // DEFAULT: light mode
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  const t = isDark ? themes.dark : themes.light;
  const CustomTooltip = makeTooltip(t);
  const tabs = ["overview", "units", "quality", "inventory"];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 2000);
    return () => clearInterval(timer);
  }, []);

  // chart colors that adapt to theme
  const chartColors = {
    crude: t.accent,
    gasoline: t.amber,
    diesel: t.blue,
    jet: t.teal,
    residual: isDark ? "#334455" : "#c4b49e",
    target: isDark ? "#334455" : "#c4b49e",
    actual: t.accent,
  };

  const tickStyle = {
    fill: t.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.textPrimary,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.35s ease, color 0.35s ease",
      }}
    >
      {/* ── AMBIENT BACKGROUND ── */}
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
            top: "-20%",
            left: "60%",
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, ${t.ambientA} 0%, transparent 60%)`,
            borderRadius: "50%",
            transition: "background 0.35s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background: `radial-gradient(circle, ${t.ambientB} 0%, transparent 60%)`,
            borderRadius: "50%",
            transition: "background 0.35s",
          }}
        />
        <svg
          width="100%"
          height="100%"
          style={{ opacity: isDark ? 0.025 : 0.04 }}
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={t.gridPattern}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 28px" }}>
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 0 16px",
            borderBottom: `1px solid ${t.headerBorder}`,
            marginBottom: "22px",
            transition: "border-color 0.35s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${t.accent}, ${isDark ? "#c24918" : "#8c2e08"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${t.accentGlow}`,
                }}
              >
                <Flame size={18} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: t.textPrimary,
                    letterSpacing: "0.02em",
                  }}
                >
                  REFINERY OPS
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: t.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Gulf Coast Complex · Unit 4
                </div>
              </div>
            </div>

            <div
              style={{ height: "32px", width: "1px", background: t.border }}
            />

            {/* Tabs */}
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
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: activeTab === tab ? t.tabActive : "transparent",
                    color: activeTab === tab ? t.tabText : t.tabInactive,
                    transition: "all 0.15s ease",
                    fontFamily: "monospace",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                background: t.tealGlow,
                border: `1px solid ${t.liveRing}`,
                borderRadius: "20px",
                padding: "5px 12px",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: t.liveDot,
                  boxShadow: `0 0 8px ${t.liveDot}`,
                  animation: "livepulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: t.liveDot,
                  letterSpacing: "0.1em",
                  fontFamily: "monospace",
                }}
              >
                LIVE
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                color: t.textMuted,
                fontFamily: "monospace",
              }}
            >
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>

            {/* Theme toggle */}
            <ThemeToggle
              isDark={isDark}
              onToggle={() => setIsDark((d) => !d)}
              t={t}
            />

            {/* Icon buttons */}
            {[Bell, Settings].map((Icon, i) => (
              <button
                key={i}
                style={{
                  width: "34px",
                  height: "34px",
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
                <Icon size={15} color={t.textMuted} />
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          <StatCard
            label="Crude Throughput"
            value="462"
            unit="kBPD"
            delta="+2.1%"
            deltaPos
            icon={Droplets}
            accent={t.accent}
            accentSoft={t.accentSoft}
            t={t}
          />
          <StatCard
            label="Net Production"
            value="14,280"
            unit="bbl/d"
            delta="+1.8%"
            deltaPos
            icon={Activity}
            accent={t.amber}
            accentSoft={t.amberGlow}
            t={t}
          />
          <StatCard
            label="Energy Intensity"
            value="87.4"
            unit="MJ/bbl"
            delta="-3.2%"
            deltaPos
            icon={Zap}
            accent={t.blue}
            accentSoft={t.blueGlow}
            t={t}
          />
          <StatCard
            label="Sulfur Content"
            value="6.8"
            unit="ppm"
            delta="-0.4 ppm"
            deltaPos
            icon={Wind}
            accent={t.teal}
            accentSoft={t.tealGlow}
            t={t}
          />
        </div>

        {/* ── MAIN CHART ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 320px",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          {/* Hourly Throughput */}
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: t.shadowCard,
              transition: "background 0.35s, border-color 0.35s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: t.textPrimary,
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  Hourly Throughput
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: t.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Today · kbd
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  ["Crude", chartColors.crude],
                  ["Gasoline", chartColors.gasoline],
                  ["Diesel", chartColors.diesel],
                  ["Jet", chartColors.jet],
                ].map(([l, c]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "2px",
                        background: c,
                        borderRadius: "2px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
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
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={throughputData}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
              >
                <defs>
                  {[
                    ["crude", chartColors.crude],
                    ["gasoline", chartColors.gasoline],
                    ["diesel", chartColors.diesel],
                    ["jet", chartColors.jet],
                  ].map(([k, c]) => (
                    <linearGradient
                      key={k}
                      id={`lg-${k}-${isDark ? "d" : "l"}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={c}
                        stopOpacity={isDark ? 0.25 : 0.18}
                      />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.gridLine} />
                <XAxis
                  dataKey="time"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="crude"
                  stroke={chartColors.crude}
                  strokeWidth={2}
                  fill={`url(#lg-crude-${isDark ? "d" : "l"})`}
                />
                <Area
                  type="monotone"
                  dataKey="gasoline"
                  stroke={chartColors.gasoline}
                  strokeWidth={2}
                  fill={`url(#lg-gasoline-${isDark ? "d" : "l"})`}
                />
                <Area
                  type="monotone"
                  dataKey="diesel"
                  stroke={chartColors.diesel}
                  strokeWidth={2}
                  fill={`url(#lg-diesel-${isDark ? "d" : "l"})`}
                />
                <Area
                  type="monotone"
                  dataKey="jet"
                  stroke={chartColors.jet}
                  strokeWidth={2}
                  fill={`url(#lg-jet-${isDark ? "d" : "l"})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Yield */}
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: t.shadowCard,
              transition: "background 0.35s, border-color 0.35s",
            }}
          >
            <div style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: t.textPrimary,
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Product Yield Distribution
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                7-Day · % of crude
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={weeklyYield}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.gridLine} />
                <XAxis
                  dataKey="day"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="gasoline"
                  stackId="a"
                  fill={chartColors.gasoline}
                />
                <Bar dataKey="diesel" stackId="a" fill={chartColors.diesel} />
                <Bar dataKey="jet" stackId="a" fill={chartColors.jet} />
                <Bar
                  dataKey="residual"
                  stackId="a"
                  fill={chartColors.residual}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Capacity Gauges */}
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: t.shadowCard,
              transition: "background 0.35s, border-color 0.35s",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: t.textPrimary,
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Capacity Utilization
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Active units
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {unitStatus
                .filter((u) => u.status !== "offline")
                .slice(0, 4)
                .map((u) => (
                  <GaugeRing
                    key={u.name}
                    value={u.load}
                    t={t}
                    color={
                      u.status === "warning"
                        ? t.amber
                        : u.load > 90
                          ? t.accent
                          : t.teal
                    }
                    label={u.name}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px 280px",
            gap: "14px",
          }}
        >
          {/* Production vs Target */}
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: t.shadowCard,
              transition: "background 0.35s, border-color 0.35s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: t.textPrimary,
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  Production vs. Target
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: t.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  8-Month · bbl/d
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                {[
                  ["Target", chartColors.target, true],
                  ["Actual", chartColors.actual, false],
                ].map(([l, c, dashed]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "0",
                        borderTop: `2px ${dashed ? "dashed" : "solid"} ${c}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
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
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={monthlyProd}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.gridLine} />
                <XAxis
                  dataKey="month"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  domain={[12000, 15000]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={chartColors.target}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={chartColors.actual}
                  strokeWidth={2.5}
                  dot={{ fill: chartColors.actual, strokeWidth: 0, r: 3.5 }}
                  activeDot={{ r: 5, fill: chartColors.actual }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Process Units Table */}
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: t.shadowCard,
              transition: "background 0.35s, border-color 0.35s",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: t.textPrimary,
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Process Units
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Live status
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "7px" }}
            >
              {unitStatus.map((u) => {
                const statusColor =
                  u.status === "optimal"
                    ? t.teal
                    : u.status === "warning"
                      ? t.amber
                      : t.offline;
                const rowBg =
                  u.status === "warning"
                    ? isDark
                      ? "rgba(244,162,97,0.06)"
                      : "rgba(181,98,26,0.05)"
                    : u.status === "offline"
                      ? isDark
                        ? "rgba(51,68,85,0.3)"
                        : "rgba(196,180,158,0.15)"
                      : t.bgSubtle;
                const rowBorder =
                  u.status === "warning"
                    ? isDark
                      ? "rgba(244,162,97,0.2)"
                      : "rgba(181,98,26,0.2)"
                    : u.status === "offline"
                      ? t.border
                      : t.border;
                return (
                  <div
                    key={u.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr auto",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      background: rowBg,
                      border: `1px solid ${rowBorder}`,
                      borderRadius: "8px",
                    }}
                  >
                    <div
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
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: statusColor,
                          boxShadow:
                            u.status !== "offline"
                              ? `0 0 6px ${statusColor}`
                              : "none",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: t.textPrimary,
                          fontWeight: 600,
                          fontFamily: "monospace",
                        }}
                      >
                        {u.name}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: t.textMuted,
                          marginBottom: "1px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: "monospace",
                        }}
                      >
                        {u.product}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            color: t.textSecondary,
                            fontFamily: "monospace",
                          }}
                        >
                          {u.temp}°C
                        </span>
                        <span style={{ fontSize: "10px", color: t.textDim }}>
                          ·
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: t.textSecondary,
                            fontFamily: "monospace",
                          }}
                        >
                          {u.pressure} bar
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color:
                          u.status === "offline" ? t.textDim : t.textPrimary,
                        fontFamily: "monospace",
                        textAlign: "right",
                      }}
                    >
                      {u.status === "offline" ? "—" : `${u.load}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Sulfur + Alerts */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Sulfur Trend */}
            <div
              style={{
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "16px",
                flex: 1,
                boxShadow: t.shadowCard,
                transition: "background 0.35s, border-color 0.35s",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: t.textPrimary,
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  Sulfur Output
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: t.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  9-Week · ppm
                </div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart
                  data={sulfurTrend}
                  margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
                >
                  <XAxis
                    dataKey="time"
                    tick={{
                      fill: t.textMuted,
                      fontSize: 9,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: t.textMuted,
                      fontSize: 9,
                      fontFamily: "monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    y={10}
                    stroke={t.amber}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="ppm"
                    stroke={t.teal}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: t.teal }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowDownRight size={12} color={t.teal} />
                <span
                  style={{
                    fontSize: "10px",
                    color: t.teal,
                    fontFamily: "monospace",
                  }}
                >
                  45% reduction over 9 weeks
                </span>
              </div>
            </div>

            {/* Alerts */}
            <div
              style={{
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                borderRadius: "12px",
                padding: "16px",
                boxShadow: t.shadowCard,
                transition: "background 0.35s, border-color 0.35s",
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
                  Alerts
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    background: t.badgeBg,
                    color: t.accent,
                    border: `1px solid ${t.badgeBorder}`,
                    borderRadius: "10px",
                    padding: "2px 8px",
                    fontFamily: "monospace",
                  }}
                >
                  {alerts.length}
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "7px" }}
              >
                {alerts.map((a) => {
                  const aColor =
                    a.level === "warn"
                      ? t.amber
                      : a.level === "good"
                        ? t.teal
                        : t.textMuted;
                  const aBg =
                    a.level === "warn"
                      ? isDark
                        ? "rgba(244,162,97,0.07)"
                        : "rgba(181,98,26,0.06)"
                      : a.level === "good"
                        ? isDark
                          ? "rgba(42,157,143,0.07)"
                          : "rgba(26,122,110,0.06)"
                        : t.bgSubtle;
                  const aBorder =
                    a.level === "warn"
                      ? isDark
                        ? "rgba(244,162,97,0.2)"
                        : "rgba(181,98,26,0.2)"
                      : a.level === "good"
                        ? isDark
                          ? "rgba(42,157,143,0.2)"
                          : "rgba(26,122,110,0.2)"
                        : t.border;
                  return (
                    <div
                      key={a.id}
                      style={{
                        padding: "9px 11px",
                        borderRadius: "8px",
                        background: aBg,
                        border: `1px solid ${aBorder}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: aColor,
                            fontFamily: "monospace",
                          }}
                        >
                          {a.unit}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            color: t.textDim,
                            fontFamily: "monospace",
                          }}
                        >
                          {a.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: t.textSecondary,
                          lineHeight: 1.4,
                          fontFamily: "monospace",
                        }}
                      >
                        {a.msg}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes livepulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        button:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}
