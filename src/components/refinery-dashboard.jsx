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
} from "lucide-react";

// ── THEME TOKENS ──────────────────────────────────────────────────────────────
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
  },
};

// ── LA REFINERY PRODUCTION DATA ───────────────────────────────────────────────
// Location: Carson, CA (North Plant) + Wilmington, CA (South Plant) — linked facilities
// Crude Capacity: 365,000 bpcd — largest refinery on the West Coast
// Employees: ~1,450
// Products: CARB gasoline, CARB diesel, conventional gasoline, distillates,
//           fuel-grade coke, anode-grade coke, chemical-grade propylene,
//           heavy fuel oil, propane, natural gas liquids
// Crude feed: CA San Joaquin Valley, LA Basin, Alaska North Slope,
//             South America, West Africa, other international waterborne
// Cogeneration: On-site cogen plant — 400 MW, largest cogen facility in CA
// Distribution: Pipeline-connected terminals; branded retail stations CA/western US
// Complexity: High-complexity (coking + hydrocracking)

// Hourly throughput scaled to 365 kBPD capacity (~90% utilization = ~328 kBPD typical)
const throughputData = [
  {
    time: "00:00",
    crude: 312,
    carbGas: 152,
    carbDiesel: 94,
    jet: 38,
    coke: 21,
    lpg: 7,
  },
  {
    time: "02:00",
    crude: 318,
    carbGas: 155,
    carbDiesel: 96,
    jet: 39,
    coke: 22,
    lpg: 6,
  },
  {
    time: "04:00",
    crude: 308,
    carbGas: 150,
    carbDiesel: 93,
    jet: 37,
    coke: 21,
    lpg: 7,
  },
  {
    time: "06:00",
    crude: 326,
    carbGas: 159,
    carbDiesel: 99,
    jet: 40,
    coke: 22,
    lpg: 6,
  },
  {
    time: "08:00",
    crude: 342,
    carbGas: 167,
    carbDiesel: 104,
    jet: 42,
    coke: 23,
    lpg: 6,
  },
  {
    time: "10:00",
    crude: 355,
    carbGas: 173,
    carbDiesel: 108,
    jet: 44,
    coke: 24,
    lpg: 6,
  },
  {
    time: "12:00",
    crude: 361,
    carbGas: 176,
    carbDiesel: 110,
    jet: 45,
    coke: 24,
    lpg: 6,
  },
  {
    time: "14:00",
    crude: 358,
    carbGas: 175,
    carbDiesel: 109,
    jet: 44,
    coke: 24,
    lpg: 6,
  },
  {
    time: "16:00",
    crude: 349,
    carbGas: 170,
    carbDiesel: 106,
    jet: 43,
    coke: 23,
    lpg: 7,
  },
  {
    time: "18:00",
    crude: 341,
    carbGas: 166,
    carbDiesel: 103,
    jet: 42,
    coke: 23,
    lpg: 7,
  },
  {
    time: "20:00",
    crude: 333,
    carbGas: 162,
    carbDiesel: 101,
    jet: 41,
    coke: 22,
    lpg: 6,
  },
  {
    time: "22:00",
    crude: 322,
    carbGas: 157,
    carbDiesel: 97,
    jet: 39,
    coke: 22,
    lpg: 5,
  },
];

// Product yield — CARB gas ~48%, diesel ~29%, jet ~12%, coke ~6%, LPG+other ~5%
const weeklyYield = [
  {
    day: "Mon",
    carbGas: 48.6,
    carbDiesel: 29.1,
    jet: 12.2,
    fuelCoke: 4.8,
    anodeCoke: 1.4,
    other: 3.9,
  },
  {
    day: "Tue",
    carbGas: 49.1,
    carbDiesel: 28.8,
    jet: 11.9,
    fuelCoke: 4.9,
    anodeCoke: 1.5,
    other: 3.8,
  },
  {
    day: "Wed",
    carbGas: 48.2,
    carbDiesel: 29.6,
    jet: 12.4,
    fuelCoke: 4.7,
    anodeCoke: 1.4,
    other: 3.7,
  },
  {
    day: "Thu",
    carbGas: 49.8,
    carbDiesel: 28.5,
    jet: 11.8,
    fuelCoke: 5.0,
    anodeCoke: 1.5,
    other: 3.4,
  },
  {
    day: "Fri",
    carbGas: 49.3,
    carbDiesel: 29.0,
    jet: 12.1,
    fuelCoke: 4.8,
    anodeCoke: 1.4,
    other: 3.4,
  },
  {
    day: "Sat",
    carbGas: 48.9,
    carbDiesel: 29.3,
    jet: 12.3,
    fuelCoke: 4.7,
    anodeCoke: 1.4,
    other: 3.4,
  },
  {
    day: "Sun",
    carbGas: 49.0,
    carbDiesel: 29.2,
    jet: 12.0,
    fuelCoke: 4.9,
    anodeCoke: 1.4,
    other: 3.5,
  },
];

// Process units — Marathon LA is a full coking/hydrocracking complex
// Units confirmed from AQMD, EPA RMP, and MPC disclosures
const unitStatus = [
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
    product: "Catalytic Reformer (CARB naphtha)",
    design: "~30 MBPD",
  },
  {
    name: "ALK-1",
    load: 74,
    temp: 15,
    pressure: 88,
    status: "optimal",
    site: "SOUTH",
    product: "Alkylation Unit (H₂SO₄)",
    design: "~15 MBPD",
  },
  {
    name: "HDS-1",
    load: 0,
    temp: 28,
    pressure: 0,
    status: "offline",
    site: "SOUTH",
    product: "Naphtha Hydrotreater — Turnaround",
    design: "Maint.",
  },
  {
    name: "COGEN",
    load: 87,
    temp: 618,
    pressure: 22,
    status: "optimal",
    site: "NORTH",
    product: "On-Site Cogeneration Plant — 400 MW",
    design: "400 MW",
  },
];

// Monthly throughput vs 365 kBPD design (utilization ~85-94%)
const monthlyProd = [
  { month: "Aug'24", target: 365, actual: 316 },
  { month: "Sep'24", target: 365, actual: 328 },
  { month: "Oct'24", target: 365, actual: 341 },
  { month: "Nov'24", target: 365, actual: 322 },
  { month: "Dec'24", target: 365, actual: 308 },
  { month: "Jan'25", target: 365, actual: 334 },
  { month: "Feb'25", target: 365, actual: 345 },
  { month: "Mar'25", target: 365, actual: 361 },
];

// Crude slate — San Joaquin Valley + LA Basin domestic + ANS + intl waterborne
// MPC processes heavy crude; ANS is medium sour; SJV is heavy sour
const crudeSlate = [
  { name: "CA San Joaquin\nValley (heavy)", pct: 28, color: "#007B40" },
  { name: "Alaska North\nSlope (ANS)", pct: 24, color: "#1a4e8a" },
  { name: "LA Basin\nCalifornia", pct: 12, color: "#5a9a30" },
  { name: "South America\n(Colombia/Brazil)", pct: 18, color: "#0a6e8a" },
  { name: "West Africa\n(Nigeria/Angola)", pct: 11, color: "#6040a0" },
  { name: "Other\nWaterborne", pct: 7, color: "#9c6010" },
];

// Sulfur in feed (heavy/sour crude) vs product sulfur (CARB spec ultra-low)
const sulfurTrend = [
  { wk: "W-8", feed: 1.64, carb: 0.0029 },
  { wk: "W-7", feed: 1.71, carb: 0.0031 },
  { wk: "W-6", feed: 1.58, carb: 0.0026 },
  { wk: "W-5", feed: 1.77, carb: 0.0028 },
  { wk: "W-4", feed: 1.82, carb: 0.0025 },
  { wk: "W-3", feed: 1.69, carb: 0.0023 },
  { wk: "W-2", feed: 1.74, carb: 0.0021 },
  { wk: "W-1", feed: 1.81, carb: 0.0019 },
  { wk: "Now", feed: 1.78, carb: 0.0018 },
];

// West Coast 3-2-1 crack spread ($/bbl) — MPC published West Coast margins
const marginTrend = [
  { mo: "Aug", spread: 24.8 },
  { mo: "Sep", spread: 21.4 },
  { mo: "Oct", spread: 19.6 },
  { mo: "Nov", spread: 16.2 },
  { mo: "Dec", spread: 14.1 },
  { mo: "Jan", spread: 17.8 },
  { mo: "Feb", spread: 19.2 },
  { mo: "Mar", spread: 18.7 },
];

// Distribution — ARCO stations (MPC owns ARCO brand in western US)
// product pipelines connect to multiple terminals; marine terminal at Port of LB
const distroChannels = [
  { channel: "Branded Retail Stations (CA/West)", pct: 44 },
  { channel: "Wholesale / Unbranded Rack", pct: 21 },
  { channel: "LAX Jet Fuel Pipeline (direct)", pct: 13 },
  { channel: "Nevada / Arizona Pipeline", pct: 12 },
  { channel: "Marine Terminal Export", pct: 6 },
  { channel: "Coke Rail / Port Export", pct: 4 },
];

const alerts = [
  {
    id: 1,
    unit: "FCC-1",
    msg: "Cat cracker regen temp 532°C — monitoring closely, limit 545°C",
    level: "warn",
    time: "8m ago",
  },
  {
    id: 2,
    unit: "HDS-1",
    msg: "Naphtha hydrotreater planned turnaround — Day 4 of 18",
    level: "info",
    time: "4d ago",
  },
  {
    id: 3,
    unit: "MARINE",
    msg: "ANS tanker 'Polar Discovery' ETA Port of Long Beach: 09:40",
    level: "info",
    time: "2h ago",
  },
  {
    id: 4,
    unit: "COGEN",
    msg: "Cogen output optimized — 348 MW, grid export in effect",
    level: "good",
    time: "1h ago",
  },
  {
    id: 5,
    unit: "CARB",
    msg: "CARB gasoline RON 91.4 — Phase 3 spec confirmed, batch released",
    level: "good",
    time: "3h ago",
  },
  {
    id: 6,
    unit: "SJV",
    msg: "San Joaquin Valley crude pipeline flow restored after brief maintenance",
    level: "good",
    time: "6h ago",
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
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

const ArcGauge = ({ value, color, label, t }) => {
  const r = 32,
    cx = 42,
    cy = 42;
  const circ = 2 * Math.PI * r;
  const track = circ * 0.75,
    arc = track * (Math.min(value, 100) / 100);
  const trackClr =
    t.bg.startsWith("#f3") || t.bg.startsWith("#f5")
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
            transition: "stroke-dasharray 1.1s ease",
          }}
        />
        <text
          x={cx}
          y={cx - 2}
          textAnchor="middle"
          fill={t.textPrimary}
          style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: 700 }}
        >
          {value}
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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "5px",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            color: t.textPrimary,
            fontSize: "24px",
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
    </div>
  );
};

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
      letterSpacing: "0.05em",
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

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function LARefineryDashboard() {
  const [isDark, setIsDark] = useState(false); // light mode default
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState("overview");

  const t = isDark ? T.dark : T.light;
  const Tip = makeTooltip(t);
  const tk = { fill: t.textMuted, fontSize: 10, fontFamily: "monospace" };
  const tabs = ["overview", "units", "crude slate", "markets"];

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 2000);
    return () => clearInterval(i);
  }, []);

  const cc = {
    crude: t.accent,
    carbGas: t.accent,
    diesel: t.blue,
    jet: t.teal,
    coke: isDark ? "#2a4535" : "#b8a888",
    other: isDark ? "#1a2e25" : "#ccc0a8",
    target: isDark ? "#1e3028" : "#c8d8c0",
    spread: t.amber,
  };

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
      {/* ambient bg */}
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
            {/* Refinery identity */}
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
                    · Los Angeles County
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{ height: "30px", width: "1px", background: t.border }}
            />

            {/* tabs */}
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
            {/* Badges */}
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
            {/* Live */}
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
            <span
              style={{
                fontSize: "11px",
                color: t.textMuted,
                fontFamily: "monospace",
              }}
            >
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>
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
          <KPICard
            label="Crude Throughput"
            value="361"
            unit="MBPD"
            sub="Design: 365 MBPD"
            delta="+3.8% vs last week"
            deltaPos
            icon={Droplets}
            accent={t.accent}
            soft={t.accentSoft}
            t={t}
          />
          <KPICard
            label="CARB Gasoline"
            value="176"
            unit="MBPD"
            sub="RON 91.4 — Phase 3"
            delta="+1.1%"
            deltaPos
            icon={Activity}
            accent={t.amber}
            soft={t.amberSoft}
            t={t}
          />
          <KPICard
            label="CARB Diesel"
            value="110"
            unit="MBPD"
            sub="15 ppm S — ULSD"
            delta="+0.9%"
            deltaPos
            icon={Zap}
            accent={t.blue}
            soft={t.blueSoft}
            t={t}
          />
          <KPICard
            label="Jet Fuel"
            value="45"
            unit="MBPD"
            sub="Direct LAX pipeline"
            delta="-0.4%"
            deltaPos={false}
            icon={Wind}
            accent={t.teal}
            soft={t.tealSoft}
            t={t}
          />
          <KPICard
            label="Cogen Output"
            value="348"
            unit="MW"
            sub="400 MW nameplate capacity"
            delta="Grid export active"
            deltaPos
            icon={TrendingUp}
            accent={t.accent}
            soft={t.accentSoft}
            t={t}
          />
          <KPICard
            label="WC 3-2-1 Spread"
            value="$18.7"
            unit="/bbl"
            sub="West Coast realized"
            delta="-$0.5 vs last week"
            deltaPos={false}
            icon={Gauge}
            accent={t.purple}
            soft={t.purpleSoft}
            t={t}
          />
        </div>

        {/* ── ROW 2: Main Charts ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.85fr 288px",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* Hourly Throughput */}
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
                  Hourly Production — Today
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
                  North Plant + South Plant combined · MBPD · 365 MBPD design
                  capacity
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
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
            <ResponsiveContainer width="100%" height={196}>
              <AreaChart
                data={throughputData}
                margin={{ top: 0, right: 0, bottom: 0, left: -16 }}
              >
                <defs>
                  {[
                    ["crude", t.accent],
                    ["carbGas", t.amber],
                    ["diesel", t.blue],
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
                  strokeOpacity={0.35}
                  label={{
                    value: "Design Cap 365k",
                    fill: t.accent,
                    fontSize: 8,
                    fontFamily: "monospace",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="crude"
                  stroke={t.accent}
                  strokeWidth={2.5}
                  fill="url(#ag-crude)"
                  name="Crude MBPD"
                />
                <Area
                  type="monotone"
                  dataKey="carbGas"
                  stroke={t.amber}
                  strokeWidth={1.5}
                  fill="url(#ag-carbGas)"
                  name="CARB Gas"
                />
                <Area
                  type="monotone"
                  dataKey="diesel"
                  stroke={t.blue}
                  strokeWidth={1.5}
                  fill="url(#ag-diesel)"
                  name="Diesel"
                />
                <Area
                  type="monotone"
                  dataKey="jet"
                  stroke={t.teal}
                  strokeWidth={1.5}
                  fill="url(#ag-jet)"
                  name="Jet Fuel"
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
                7-Day · % of crude feed · incl. coke grades
              </div>
            </div>
            <ResponsiveContainer width="100%" height={196}>
              <BarChart
                data={weeklyYield}
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
                  dataKey="carbGas"
                  stackId="a"
                  fill={t.accent}
                  name="CARB Gas %"
                />
                <Bar
                  dataKey="carbDiesel"
                  stackId="a"
                  fill={t.blue}
                  name="CARB Diesel %"
                />
                <Bar
                  dataKey="jet"
                  stackId="a"
                  fill={t.teal}
                  name="Jet Fuel %"
                />
                <Bar
                  dataKey="fuelCoke"
                  stackId="a"
                  fill={cc.coke}
                  name="Fuel Coke %"
                />
                <Bar
                  dataKey="anodeCoke"
                  stackId="a"
                  fill={isDark ? "#3a5540" : "#a09070"}
                  name="Anode Coke %"
                />
                <Bar
                  dataKey="other"
                  stackId="a"
                  fill={cc.other}
                  name="LPG/Other %"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Utilization Gauges */}
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
                Online units · % of design rate
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "4px",
              }}
            >
              {unitStatus
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
                alignItems: "flex-start",
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
                HDS-1 naphtha hydrotreater offline — planned 18-day turnaround,
                Day 4
              </span>
            </div>
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
          {/* Crude Slate Donut */}
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
                Heavy sour focus — SJV · ANS · South America · West Africa
              </div>
            </div>
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
                            {payload[0].payload.name.replace(/\n/g, " ")}:{" "}
                            {payload[0].value}%
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
                      {e.name.replace(/\n/g, " ")}
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
          </div>

          {/* Throughput vs Design */}
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
                Throughput vs. Design Capacity
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
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={monthlyProd}
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
                  type="monotone"
                  dataKey="target"
                  stroke={cc.target}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Design Cap"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={t.accent}
                  strokeWidth={2.5}
                  dot={{ fill: t.accent, strokeWidth: 0, r: 3.5 }}
                  activeDot={{ r: 5, fill: t.accent }}
                  name="Actual MBPD"
                />
              </LineChart>
            </ResponsiveContainer>
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
                $/bbl realized West Coast margin · MPC published
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={marginTrend}
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
                <Bar dataKey="spread" name="$/bbl" radius={[3, 3, 0, 0]}>
                  {marginTrend.map((e, i) => (
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
            <div
              style={{
                marginTop: "8px",
                padding: "7px 10px",
                borderRadius: "6px",
                background: t.accentSoft,
                border: `1px solid ${t.accent}28`,
                fontSize: "9px",
                color: t.textSecondary,
                fontFamily: "monospace",
                lineHeight: 1.5,
              }}
            >
              ✓ MPC West Coast utilization ~90–94% typical. Q1'25 margin
              recovery vs. Q4'24 trough.
            </div>
          </div>
        </div>

        {/* ── ROW 4: Units + Distribution + Alerts ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 240px 290px",
            gap: "12px",
          }}
        >
          {/* Process Units */}
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
                  North Plant + South Plant facilities · °C · barg · % design
                  rate
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
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px",
              }}
            >
              {unitStatus.map((u) => {
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
                            transition: "width 1s ease",
                            boxShadow: `0 0 4px ${sc}55`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Distribution */}
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
              {distroChannels.map((d, i) => {
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
                          transition: "width 1s ease",
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
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
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
                  Crude imports via marine terminal — Port of Long Beach / Port
                  of LA
                </span>
              </div>
              <div
                style={{
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
                Pipeline-connected terminals serve CA, NV, and AZ markets via
                the refined products pipeline network
              </div>
            </div>
          </div>

          {/* Alerts + Footer */}
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
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flex: 1,
              }}
            >
              {alerts.map((a) => {
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
                        ? "rgba(0,192,96,0.07)"
                        : "rgba(0,123,64,0.06)"
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
                ℹ Regulator: South Coast AQMD · CARB Phase 3 in effect
                <br />
                On-site cogen: 400 MW nameplate (largest cogen facility in CA)
                <br />
                Crude import terminal: Port of Los Angeles / Long Beach
                <br />
                Crude slate: SJV pipeline + Alaska North Slope + waterborne
                intl.
                <br />
                Capacity: 365,000 bpcd — West Coast largest complex
                <br />
                Employees: ~1,450 · High-complexity coking/hydrocracking
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes lp { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; } button:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,83,138,0.25); border-radius: 4px; }
      `}</style>
    </div>
  );
}
