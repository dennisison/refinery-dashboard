import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PieChart, Pie, ReferenceLine
} from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Droplets, Flame, Wind, ChevronRight, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Settings, Bell, Search } from "lucide-react";

// ── DATA ──────────────────────────────────────────────────────────────────────
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
  { name: "CDU-1", load: 94, temp: 368, pressure: 142, status: "optimal", product: "Atmospheric Distillation" },
  { name: "VDU-2", load: 87, temp: 412, pressure: 18, status: "optimal", product: "Vacuum Distillation" },
  { name: "FCC-1", load: 91, temp: 524, pressure: 28, status: "warning", product: "Fluid Cat Cracking" },
  { name: "HDS-3", load: 78, temp: 356, pressure: 68, status: "optimal", product: "Hydrodesulfurization" },
  { name: "RFM-2", load: 96, temp: 497, pressure: 22, status: "optimal", product: "Catalytic Reforming" },
  { name: "ALK-1", load: 65, temp: 12, pressure: 89, status: "offline", product: "Alkylation Unit" },
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

const inventoryData = [
  { name: "Crude", value: 68, color: "#1a1a2e", fill: "#e8612a" },
  { name: "Gasoline", value: 82, color: "#1a1a2e", fill: "#f4a261" },
  { name: "Diesel", value: 55, color: "#1a1a2e", fill: "#457b9d" },
  { name: "Jet Fuel", value: 71, color: "#1a1a2e", fill: "#2a9d8f" },
];

const sulfurTrend = [
  { time: "W-8", ppm: 12.4 }, { time: "W-7", ppm: 11.8 }, { time: "W-6", ppm: 13.1 },
  { time: "W-5", ppm: 10.9 }, { time: "W-4", ppm: 9.7 }, { time: "W-3", ppm: 8.4 },
  { time: "W-2", ppm: 7.9 }, { time: "W-1", ppm: 7.2 }, { time: "Now", ppm: 6.8 },
];

const alerts = [
  { id: 1, unit: "FCC-1", msg: "Regenerator temp approaching limit", level: "warn", time: "4m ago" },
  { id: 2, unit: "ALK-1", msg: "Scheduled maintenance — offline", level: "info", time: "2h ago" },
  { id: 3, unit: "CDU-1", msg: "Crude feed rate optimized +2.3%", level: "good", time: "3h ago" },
];

// ── CUSTOM TOOLTIP ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(8,8,20,0.95)",
      border: "1px solid rgba(232,97,42,0.3)",
      borderRadius: "8px",
      padding: "10px 14px",
      backdropFilter: "blur(12px)"
    }}>
      <p style={{ color: "#e8612a", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#8899aa", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>{p.name}</span>
          <span style={{ color: "#dde6f0", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── GAUGE ──────────────────────────────────────────────────────────────────────
const GaugeRing = ({ value, color, label, unit }) => {
  const r = 38, cx = 52, cy = 52;
  const circumference = 2 * Math.PI * r;
  const arc = (value / 100) * circumference * 0.75;
  const rotation = -135;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset="0"
          transform={`rotate(${rotation} ${cx} ${cy})`}
          strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset="0"
          transform={`rotate(${rotation} ${cx} ${cy})`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#dde6f0"
          style={{ fontSize: "18px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{value}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#556677"
          style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace" }}>%</text>
      </svg>
      <span style={{ color: "#8899aa", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
};

// ── STAT CARD ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit, delta, deltaPos, icon: Icon, accent }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    transition: "border-color 0.2s",
    cursor: "default"
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}40`}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
  >
    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
      background: `radial-gradient(circle at 100% 0%, ${accent}18 0%, transparent 70%)`,
      borderRadius: "0 12px 0 100%" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
      <span style={{ color: "#556677", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <div style={{ padding: "6px", borderRadius: "8px", background: `${accent}18` }}>
        <Icon size={14} color={accent} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
      <span style={{ color: "#dde6f0", fontSize: "28px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, lineHeight: 1 }}>{value}</span>
      <span style={{ color: "#556677", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}>{unit}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {deltaPos ? <ArrowUpRight size={12} color="#2a9d8f" /> : <ArrowDownRight size={12} color="#e63946" />}
      <span style={{ color: deltaPos ? "#2a9d8f" : "#e63946", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>{delta}</span>
      <span style={{ color: "#445566", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>vs. yesterday</span>
    </div>
  </div>
);

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function RefineryDashboard() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => { setTime(new Date()); setPulse(p => !p); }, 2000);
    return () => clearInterval(t);
  }, []);

  const tabs = ["overview", "units", "quality", "inventory"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060912",
      color: "#dde6f0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "60%", width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(232,97,42,0.05) 0%, transparent 60%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(69,123,157,0.06) 0%, transparent 60%)", borderRadius: "50%" }} />
        {/* grid */}
        <svg width="100%" height="100%" style={{ opacity: 0.025 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8899aa" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 24px" }}>
        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #e8612a, #c24918)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(232,97,42,0.4)" }}>
                <Flame size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#dde6f0", letterSpacing: "0.02em" }}>REFINERY OPS</div>
                <div style={{ fontSize: "10px", color: "#445566", letterSpacing: "0.1em", textTransform: "uppercase" }}>Gulf Coast Complex · Unit 4</div>
              </div>
            </div>

            <div style={{ height: "32px", width: "1px", background: "rgba(255,255,255,0.08)" }} />

            {/* tabs */}
            <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.03)",
              borderRadius: "8px", padding: "3px" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{
                    padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
                    fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em",
                    background: activeTab === t ? "rgba(232,97,42,0.2)" : "transparent",
                    color: activeTab === t ? "#e8612a" : "#556677",
                    transition: "all 0.15s"
                  }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* live badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "7px",
              background: "rgba(42,157,143,0.1)", border: "1px solid rgba(42,157,143,0.25)",
              borderRadius: "20px", padding: "5px 12px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#2a9d8f",
                boxShadow: "0 0 8px #2a9d8f", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "10px", color: "#2a9d8f", letterSpacing: "0.1em" }}>LIVE</span>
            </div>
            <span style={{ fontSize: "12px", color: "#445566" }}>
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {[Bell, Settings].map((Icon, i) => (
                <button key={i} style={{ width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon size={14} color="#556677" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
          <StatCard label="Crude Throughput" value="462" unit="kBPD" delta="+2.1%" deltaPos icon={Droplets} accent="#e8612a" />
          <StatCard label="Net Production" value="14,280" unit="bbl/d" delta="+1.8%" deltaPos icon={Activity} accent="#f4a261" />
          <StatCard label="Energy Intensity" value="87.4" unit="MJ/bbl" delta="-3.2%" deltaPos icon={Zap} accent="#457b9d" />
          <StatCard label="Sulfur Content" value="6.8" unit="ppm" delta="-0.4 ppm" deltaPos icon={Wind} accent="#2a9d8f" />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: "14px", marginBottom: "14px" }}>

          {/* Throughput Chart */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Hourly Throughput</div>
                <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>Today · kbd</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {[["Crude","#e8612a"],["Gasoline","#f4a261"],["Diesel","#457b9d"],["Jet","#2a9d8f"]].map(([l,c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "8px", height: "2px", background: c, borderRadius: "2px" }} />
                    <span style={{ fontSize: "10px", color: "#556677" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={throughputData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  {[["crude","#e8612a"],["gasoline","#f4a261"],["diesel","#457b9d"],["jet","#2a9d8f"]].map(([k,c]) => (
                    <linearGradient key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="crude" stroke="#e8612a" strokeWidth={2} fill="url(#gcrude)" />
                <Area type="monotone" dataKey="gasoline" stroke="#f4a261" strokeWidth={2} fill="url(#ggasoline)" />
                <Area type="monotone" dataKey="diesel" stroke="#457b9d" strokeWidth={2} fill="url(#gdiesel)" />
                <Area type="monotone" dataKey="jet" stroke="#2a9d8f" strokeWidth={2} fill="url(#gjet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Yield */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Product Yield Distribution</div>
              <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>7-Day · % of crude</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyYield} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gasoline" stackId="a" fill="#e8612a" radius={[0,0,0,0]} />
                <Bar dataKey="diesel" stackId="a" fill="#457b9d" />
                <Bar dataKey="jet" stackId="a" fill="#2a9d8f" />
                <Bar dataKey="residual" stackId="a" fill="#334455" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Unit Gauges */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Capacity Utilization</div>
              <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active units</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {unitStatus.filter(u => u.status !== "offline").slice(0,4).map(u => (
                <GaugeRing key={u.name} value={u.load}
                  color={u.status === "warning" ? "#f4a261" : u.load > 90 ? "#e8612a" : "#2a9d8f"}
                  label={u.name} />
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px 280px", gap: "14px" }}>

          {/* Monthly Production vs Target */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Production vs. Target</div>
                <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>8-Month · bbl/d</div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                {[["Target","#334455"],["Actual","#e8612a"]].map(([l,c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "2px", background: c, borderRadius: "2px",
                      ...(l === "Target" ? { borderTop: "2px dashed "+c, background: "transparent" } : {}) }} />
                    <span style={{ fontSize: "10px", color: "#556677" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyProd} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#445566", fontSize: 10 }} axisLine={false} tickLine={false} domain={[12000, 15000]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="target" stroke="#334455" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#e8612a" strokeWidth={2}
                  dot={{ fill: "#e8612a", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#e8612a", boxShadow: "0 0 8px #e8612a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Unit Status Table */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Process Units</div>
              <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live status</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {unitStatus.map(u => (
                <div key={u.name} style={{
                  display: "grid", gridTemplateColumns: "52px 1fr auto",
                  alignItems: "center", gap: "10px",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${u.status === "warning" ? "rgba(244,162,97,0.25)" : u.status === "offline" ? "rgba(100,116,139,0.2)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                      background: u.status === "optimal" ? "#2a9d8f" : u.status === "warning" ? "#f4a261" : "#334455",
                      boxShadow: u.status === "optimal" ? "0 0 6px #2a9d8f" : u.status === "warning" ? "0 0 6px #f4a261" : "none"
                    }} />
                    <span style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600 }}>{u.name}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#556677", marginBottom: "1px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{u.product}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#8899aa" }}>{u.temp}°C</span>
                      <span style={{ fontSize: "10px", color: "#445566" }}>·</span>
                      <span style={{ fontSize: "10px", color: "#8899aa" }}>{u.pressure} bar</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em",
                    color: u.status === "offline" ? "#334455" : `${u.load}%` && "#dde6f0",
                    textAlign: "right"
                  }}>
                    {u.status === "offline" ? "—" : `${u.load}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts + Sulfur */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Sulfur Trend */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px", padding: "16px", flex: 1 }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600, marginBottom: "2px" }}>Sulfur Output</div>
                <div style={{ fontSize: "10px", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em" }}>9-Week trend · ppm</div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={sulfurTrend} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <XAxis dataKey="time" tick={{ fill: "#445566", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#445566", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={10} stroke="rgba(244,162,97,0.3)" strokeDasharray="4 4" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="ppm" stroke="#2a9d8f" strokeWidth={2}
                    dot={false} activeDot={{ r: 4, fill: "#2a9d8f" }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ArrowDownRight size={12} color="#2a9d8f" />
                <span style={{ fontSize: "10px", color: "#2a9d8f" }}>45% reduction over 9 weeks</span>
              </div>
            </div>

            {/* Alerts */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", color: "#dde6f0", fontWeight: 600 }}>Alerts</div>
                <div style={{ fontSize: "10px", background: "rgba(232,97,42,0.15)", color: "#e8612a",
                  border: "1px solid rgba(232,97,42,0.25)", borderRadius: "10px", padding: "2px 8px" }}>
                  {alerts.length}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {alerts.map(a => (
                  <div key={a.id} style={{ padding: "9px 11px", borderRadius: "8px",
                    background: a.level === "warn" ? "rgba(244,162,97,0.07)" : a.level === "good" ? "rgba(42,157,143,0.07)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${a.level === "warn" ? "rgba(244,162,97,0.2)" : a.level === "good" ? "rgba(42,157,143,0.2)" : "rgba(255,255,255,0.05)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700,
                        color: a.level === "warn" ? "#f4a261" : a.level === "good" ? "#2a9d8f" : "#556677" }}>{a.unit}</span>
                      <span style={{ fontSize: "9px", color: "#445566" }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: "10px", color: "#8899aa", lineHeight: 1.4 }}>{a.msg}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060912; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(232,97,42,0.3); border-radius: 4px; }
        button:focus { outline: none; }
      `}</style>
    </div>
  );
}
