/**
 * KPIModal.jsx — full trend chart drawer, opens when a KPI card is clicked
 */
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { makeTooltip, tickStyle } from "../shared/Theme";

// Generate 48 hours of synthetic history for the selected KPI
function generateHistory(kpiKey, currentValue) {
  const configs = {
    crudeThroughput: {
      base: 340,
      range: 30,
      unit: "MBPD",
      refLine: 365,
      refLabel: "Design Cap",
    },
    carbGasoline: { base: 165, range: 15, unit: "MBPD" },
    carbDiesel: { base: 104, range: 10, unit: "MBPD" },
    jetFuel: { base: 43, range: 4, unit: "MBPD" },
    cogenOutput: {
      base: 335,
      range: 25,
      unit: "MW",
      refLine: 400,
      refLabel: "Nameplate",
    },
    crackSpread: {
      base: 17,
      range: 6,
      unit: "$/bbl",
      refLine: 16,
      refLabel: "Breakeven",
    },
  };
  const cfg = configs[kpiKey] || { base: currentValue, range: 5, unit: "" };
  const points = [];
  const now = new Date();
  for (let i = 47; i >= 0; i--) {
    const ts = new Date(now - i * 3600000);
    const hh = ts.getHours().toString().padStart(2, "0");
    const dd = ts.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const noise = (Math.random() - 0.5) * cfg.range;
    // Add a realistic dip pattern overnight
    const hourFactor =
      Math.sin(((ts.getHours() - 6) * Math.PI) / 18) * (cfg.range * 0.3);
    points.push({
      time: i % 6 === 0 ? `${dd} ${hh}:00` : `${hh}:00`,
      value: parseFloat(
        Math.max(cfg.base * 0.7, cfg.base + noise + hourFactor).toFixed(1),
      ),
    });
  }
  // Anchor last point to current value
  points[points.length - 1].value = currentValue;
  return { points, cfg };
}

const KPI_LABELS = {
  crudeThroughput: "Crude Throughput",
  carbGasoline: "CARB Gasoline",
  carbDiesel: "CARB Diesel",
  jetFuel: "Jet Fuel",
  cogenOutput: "Cogen Output",
  crackSpread: "WC Crack Spread",
};

export default function KPIModal({ kpiKey, kpis, onClose, isDark, t }) {
  if (!kpiKey || !kpis) return null;

  const kpi = kpis[kpiKey];
  if (!kpi) return null;

  const { points, cfg } = generateHistory(kpiKey, kpi.value);
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = parseFloat(
    (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
  );
  const trend = values[values.length - 1] > values[0] ? "↑" : "↓";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: t.bgOverlay,
          zIndex: 100,
          backdropFilter: "blur(4px)",
          animation: "fadeOverlay 0.2s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "560px",
          background: t.modalBg,
          borderLeft: `1px solid ${t.border}`,
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          boxShadow: t.shadowLg,
          animation: "slideIn 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 24px 18px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                color: t.textMuted,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              KPI Trend — 48 Hour History
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: t.textPrimary,
                fontFamily: "monospace",
                letterSpacing: "0.02em",
              }}
            >
              {KPI_LABELS[kpiKey]}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: t.accent,
                  fontFamily: "monospace",
                }}
              >
                {kpi.value}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: t.textMuted,
                  fontFamily: "monospace",
                }}
              >
                {kpi.unit}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: t.textMuted,
                  fontFamily: "monospace",
                  marginLeft: "4px",
                }}
              >
                {trend}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: t.bgSubtle,
              border: `1px solid ${t.border}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color={t.textMuted} />
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "1px",
            background: t.border,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {[
            ["Current", kpi.value, kpi.unit],
            ["48h High", max, kpi.unit],
            ["48h Low", min, kpi.unit],
            ["48h Avg", avg, kpi.unit],
          ].map(([label, val, unit]) => (
            <div
              key={label}
              style={{ padding: "14px 16px", background: t.bgCard }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: t.textMuted,
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: t.textDim,
                  fontFamily: "monospace",
                }}
              >
                {unit}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          <div
            style={{
              fontSize: "10px",
              color: t.textMuted,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            Hourly values — last 48 hours
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={points}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis
                dataKey="time"
                tick={{ ...tk, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={5}
              />
              <YAxis tick={tk} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              {cfg.refLine && (
                <ReferenceLine
                  y={cfg.refLine}
                  stroke={t.warn}
                  strokeDasharray="5 4"
                  strokeOpacity={0.6}
                  label={{
                    value: cfg.refLabel,
                    fill: t.warn,
                    fontSize: 9,
                    fontFamily: "monospace",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={t.accent}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: t.accent }}
                name={KPI_LABELS[kpiKey]}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Sub-info */}
          {kpi.sub && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: t.bgSubtle,
                border: `1px solid ${t.border}`,
                fontSize: "11px",
                color: t.textSecondary,
                fontFamily: "monospace",
              }}
            >
              {kpi.sub}
            </div>
          )}

          {/* Note about data source */}
          <div
            style={{
              marginTop: "12px",
              fontSize: "9px",
              color: t.textDim,
              fontFamily: "monospace",
              lineHeight: 1.6,
            }}
          >
            Data source: API /kpis · Polling interval: 5s
            <br />
            History: synthetic drift model — swap for historian query
            (PI/PHD/IP21)
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn      { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes fadeOverlay  { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
}
