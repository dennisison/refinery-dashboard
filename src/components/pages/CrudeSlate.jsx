/**
 * CrudeSlate.jsx
 * Tabs: Supply Mix | Tanker Schedule | Pipeline Flows | Crude Quality
 */
import { useState } from "react";

import {
  Ship,
  Droplets,
  FlaskConical,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { makeTooltip, tickStyle, Skeleton } from "../shared/Theme";

// ── STATIC DATA (swap these arrays for API calls) ─────────────────────────────
/*
const TANKERS = [
  {
    vessel: "Polar Discovery",
    origin: "Alaska (ANS)",
    eta: "Today 09:40",
    bbl: 650000,
    api: 31.5,
    sulfur: 1.05,
    status: "inbound",
  },
  {
    vessel: "Pacific Mariner",
    origin: "Colombia (Vasconia)",
    eta: "Today 14:20",
    bbl: 500000,
    api: 24.1,
    sulfur: 1.72,
    status: "inbound",
  },
  {
    vessel: "Gulf Sovereign",
    origin: "Nigeria (Bonny Light)",
    eta: "Tomorrow 06:00",
    bbl: 700000,
    api: 35.4,
    sulfur: 0.14,
    status: "scheduled",
  },
  {
    vessel: "Long Beach Star",
    origin: "Ecuador (Oriente)",
    eta: "Tomorrow 18:45",
    bbl: 450000,
    api: 29.2,
    sulfur: 1.61,
    status: "scheduled",
  },
  {
    vessel: "Pacific Endeavour",
    origin: "Brazil (Marlim)",
    eta: "Mar 9 08:00",
    bbl: 550000,
    api: 19.8,
    sulfur: 0.77,
    status: "scheduled",
  },
  {
    vessel: "ANS Pioneer",
    origin: "Alaska (ANS)",
    eta: "Mar 11 12:30",
    bbl: 700000,
    api: 31.5,
    sulfur: 1.05,
    status: "scheduled",
  },
];

const PIPELINE_FLOWS = [
  { time: "00:00", sjv: 128, ans_pipe: 0, lb_marine: 0 },
  { time: "02:00", sjv: 131, ans_pipe: 0, lb_marine: 0 },
  { time: "04:00", sjv: 129, ans_pipe: 0, lb_marine: 0 },
  { time: "06:00", sjv: 134, ans_pipe: 0, lb_marine: 0 },
  { time: "08:00", sjv: 136, ans_pipe: 0, lb_marine: 88 },
  { time: "10:00", sjv: 138, ans_pipe: 0, lb_marine: 92 },
  { time: "12:00", sjv: 135, ans_pipe: 72, lb_marine: 90 },
  { time: "14:00", sjv: 133, ans_pipe: 74, lb_marine: 88 },
  { time: "16:00", sjv: 132, ans_pipe: 70, lb_marine: 0 },
  { time: "18:00", sjv: 130, ans_pipe: 68, lb_marine: 0 },
  { time: "20:00", sjv: 128, ans_pipe: 65, lb_marine: 0 },
  { time: "22:00", sjv: 126, ans_pipe: 0, lb_marine: 0 },
];*/

const CRUDE_GRADES = [
  {
    grade: "SJV Heavy",
    api: 13.5,
    sulfur: 1.2,
    ni: 95,
    v: 450,
    origin: "CA Pipeline",
    vol: 102,
    color: "#1a538a",
  },
  {
    grade: "ANS Medium",
    api: 31.5,
    sulfur: 1.05,
    ni: 18,
    v: 52,
    origin: "Marine / ANS",
    vol: 88,
    color: "#4a80c0",
  },
  {
    grade: "LA Basin",
    api: 22.4,
    sulfur: 1.48,
    ni: 65,
    v: 175,
    origin: "CA Pipeline",
    vol: 44,
    color: "#2a7a50",
  },
  {
    grade: "Vasconia Blend",
    api: 24.1,
    sulfur: 1.72,
    ni: 42,
    v: 140,
    origin: "Marine Import",
    vol: 66,
    color: "#0a6e8a",
  },
  {
    grade: "Bonny Light",
    api: 35.4,
    sulfur: 0.14,
    ni: 6,
    v: 12,
    origin: "Marine Import",
    vol: 40,
    color: "#6040a0",
  },
  {
    grade: "Marlim",
    api: 19.8,
    sulfur: 0.77,
    ni: 28,
    v: 135,
    origin: "Marine Import",
    vol: 21,
    color: "#9c6010",
  },
];

const SLATE_MIX = [
  { name: "SJV Heavy", pct: 28, color: "#1a538a" },
  { name: "ANS Medium", pct: 24, color: "#4a80c0" },
  { name: "LA Basin", pct: 12, color: "#2a7a50" },
  { name: "Vasconia Blend", pct: 18, color: "#0a6e8a" },
  { name: "Bonny Light", pct: 11, color: "#6040a0" },
  { name: "Marlim", pct: 7, color: "#9c6010" },
];

// ── SUB-TABS ──────────────────────────────────────────────────────────────────
const TABS = [
  "Supply Mix",
  "Tanker Schedule",
  "Pipeline Flows",
  "Crude Quality",
];

function TabBar({ active, onSelect, t }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "2px",
        background: t.bgSubtle,
        border: `1px solid ${t.border}`,
        borderRadius: "9px",
        padding: "3px",
        marginBottom: "20px",
        width: "fit-content",
      }}
    >
      {TABS.map((tb) => (
        <button
          key={tb}
          onClick={() => onSelect(tb)}
          style={{
            padding: "6px 14px",
            borderRadius: "7px",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
            background: active === tb ? t.tabActive : "transparent",
            color: active === tb ? t.tabText : t.tabInactive,
            transition: "all 0.15s",
          }}
        >
          {tb}
        </button>
      ))}
    </div>
  );
}

// ── SUPPLY MIX TAB ────────────────────────────────────────────────────────────
function SupplyMixTab({ t }) {
  const Tip = makeTooltip(t);
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}
    >
      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: t.textPrimary,
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          Current Crude Slate
        </div>
        <div
          style={{
            fontSize: "9px",
            color: t.textMuted,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "16px",
          }}
        >
          % of total feed · 361 MBPD
        </div>
        <PieChart width={220} height={200}>
          <Pie
            data={SLATE_MIX}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={88}
            dataKey="pct"
            paddingAngle={2}
          >
            {SLATE_MIX.map((e, i) => (
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {SLATE_MIX.map((e) => (
            <div
              key={e.name}
              style={{ display: "flex", alignItems: "center", gap: "7px" }}
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
                  fontSize: "10px",
                  color: t.textSecondary,
                  fontFamily: "monospace",
                  flex: 1,
                }}
              >
                {e.name}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {e.pct}%
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: t.textDim,
                  fontFamily: "monospace",
                }}
              >
                {Math.round((361 * e.pct) / 100)} MBPD
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: t.textPrimary,
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          Volume by Crude Grade
        </div>
        <div
          style={{
            fontSize: "9px",
            color: t.textMuted,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "14px",
          }}
        >
          MBPD today
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={CRUDE_GRADES}
            margin={{ top: 0, right: 0, bottom: 40, left: -10 }}
            layout="vertical"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={t.grid}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={tickStyle(t)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="grade"
              tick={{ ...tickStyle(t), fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={95}
            />
            <Tooltip content={<Tip />} />
            <Bar dataKey="vol" name="MBPD" radius={[0, 4, 4, 0]}>
              {CRUDE_GRADES.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── TANKER SCHEDULE TAB ───────────────────────────────────────────────────────
function TankerScheduleTab({ t, tankers }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {[
          { label: "Inbound Today", value: 2, color: t.accent },
          { label: "Scheduled", value: 4, color: t.blue },
          { label: "Total Barrels", value: "2.55M", color: t.teal },
        ].map(({ label, value, color }) => (
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
                fontSize: "9px",
                color: t.textMuted,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color,
                fontFamily: "monospace",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderRadius: "12px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: t.textPrimary,
              fontFamily: "monospace",
            }}
          >
            Marine Vessel Schedule — Port of LA / Long Beach
          </div>
          <div
            style={{
              fontSize: "9px",
              color: t.textMuted,
              fontFamily: "monospace",
              background: t.bgSubtle,
              padding: "3px 8px",
              borderRadius: "4px",
            }}
          >
            Updates on pilot confirmation
          </div>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1.4fr 1fr 0.8fr 0.6fr 0.6fr 0.8fr",
            padding: "8px 18px",
            background: t.bgSubtle,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {[
            "Vessel",
            "Origin",
            "ETA",
            "Barrels",
            "API°",
            "Sulfur %",
            "Status",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "8px",
                color: t.textDim,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {TANKERS.map((v, i) => {
          const isInbound = v.status === "inbound";
          const statusColor = isInbound ? t.good : t.blue;
          const rowBg = i % 2 === 0 ? "transparent" : t.bgSubtle;
          return (
            <div
              key={v.vessel}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.4fr 1fr 0.8fr 0.6fr 0.6fr 0.8fr",
                padding: "11px 18px",
                background: rowBg,
                borderBottom: `1px solid ${t.border}`,
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "7px" }}
              >
                <Ship size={11} color={statusColor} />
                <span
                  style={{
                    fontSize: "11px",
                    color: t.textPrimary,
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {v.vessel}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textSecondary,
                  fontFamily: "monospace",
                }}
              >
                {v.origin}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Clock size={9} color={isInbound ? t.good : t.textDim} />
                <span
                  style={{
                    fontSize: "10px",
                    color: isInbound ? t.good : t.textSecondary,
                    fontFamily: "monospace",
                    fontWeight: isInbound ? 600 : 400,
                  }}
                >
                  {v.eta}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {(v.bbl / 1000).toFixed(0)}k bbl
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {v.api}°
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color:
                    v.sulfur > 1.5
                      ? t.warn
                      : v.sulfur < 0.5
                        ? t.good
                        : t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {v.sulfur}%
              </span>
              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  width: "fit-content",
                  background: `${statusColor}14`,
                  border: `1px solid ${statusColor}28`,
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: statusColor,
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {v.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PIPELINE FLOWS TAB ────────────────────────────────────────────────────────
function PipelineFlowsTab({ t, isDark }) {
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          padding: "18px",
          borderRadius: "12px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: t.textPrimary,
            fontFamily: "monospace",
            marginBottom: "4px",
          }}
        >
          Crude Intake by Source — Today (MBPD)
        </div>
        <div
          style={{
            fontSize: "9px",
            color: t.textMuted,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "16px",
          }}
        >
          SJV Pipeline · ANS Pipeline · LB Marine Terminal
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={PIPELINE_FLOWS}
            margin={{ top: 0, right: 0, bottom: 0, left: -16 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="time" tick={tk} axisLine={false} tickLine={false} />
            <YAxis tick={tk} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Bar
              dataKey="sjv"
              stackId="a"
              fill={t.accent}
              name="SJV Pipeline"
            />
            <Bar
              dataKey="ans_pipe"
              stackId="a"
              fill={t.blue}
              name="ANS Pipeline"
            />
            <Bar
              dataKey="lb_marine"
              stackId="a"
              fill={t.teal}
              name="LB Marine"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        {[
          {
            label: "SJV Pipeline",
            value: "132 MBPD",
            sub: "Kern River / Midway-Sunset fields",
            color: t.accent,
            trend: "Steady",
          },
          {
            label: "ANS Pipeline",
            value: "68 MBPD",
            sub: "Trans-Alaska Pipeline → marine",
            color: t.blue,
            trend: "Active",
          },
          {
            label: "LB Marine",
            value: "90 MBPD",
            sub: "Port of LB / LA tanker offload",
            color: t.teal,
            trend: "Offloading",
          },
        ].map(({ label, value, sub, color, trend }) => (
          <div
            key={label}
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
                fontSize: "9px",
                color: t.textMuted,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color,
                fontFamily: "monospace",
                marginBottom: "4px",
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: "9px",
                color: t.textDim,
                fontFamily: "monospace",
                marginBottom: "6px",
              }}
            >
              {sub}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle size={9} color={t.good} />
              <span
                style={{
                  fontSize: "9px",
                  color: t.good,
                  fontFamily: "monospace",
                }}
              >
                {trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CRUDE QUALITY TAB ─────────────────────────────────────────────────────────
function CrudeQualityTab({ t }) {
  return (
    <div>
      <div
        style={{
          borderRadius: "12px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: t.textPrimary,
              fontFamily: "monospace",
            }}
          >
            Crude Grade Quality Specifications
          </div>
          <div
            style={{
              fontSize: "9px",
              color: t.textMuted,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginTop: "2px",
            }}
          >
            API gravity · sulfur wt% · Ni/V metals content (ppm) · planned
            intake MBPD
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.7fr 0.7fr 0.8fr 0.8fr",
            padding: "8px 18px",
            background: t.bgSubtle,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {[
            "Grade",
            "Origin",
            "API°",
            "Sulfur %",
            "Ni (ppm)",
            "V (ppm)",
            "MBPD",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "8px",
                color: t.textDim,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {CRUDE_GRADES.map((g, i) => (
          <div
            key={g.grade}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.7fr 0.7fr 0.8fr 0.8fr",
              padding: "11px 18px",
              alignItems: "center",
              background: i % 2 === 0 ? "transparent" : t.bgSubtle,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  background: g.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {g.grade}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                color: t.textSecondary,
                fontFamily: "monospace",
              }}
            >
              {g.origin}
            </span>
            <span
              style={{
                fontSize: "10px",
                color:
                  g.api < 20 ? t.warn : g.api > 33 ? t.good : t.textPrimary,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {g.api}°
            </span>
            <span
              style={{
                fontSize: "10px",
                color:
                  g.sulfur > 1.5
                    ? t.warn
                    : g.sulfur < 0.5
                      ? t.good
                      : t.textPrimary,
                fontFamily: "monospace",
              }}
            >
              {g.sulfur}%
            </span>
            <span
              style={{
                fontSize: "10px",
                color: g.ni > 50 ? t.warn : t.textPrimary,
                fontFamily: "monospace",
              }}
            >
              {g.ni}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: g.v > 200 ? t.warn : t.textPrimary,
                fontFamily: "monospace",
              }}
            >
              {g.v}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: t.accent,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {g.vol}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "8px",
          background: t.amberSoft,
          border: `1px solid ${t.amber}28`,
          fontSize: "9px",
          color: t.amber,
          fontFamily: "monospace",
          lineHeight: 1.6,
        }}
      >
        ⚠ SJV Heavy — high metals (Ni 95, V 450 ppm). Monitor FCC catalyst
        deactivation rate and DCK drum coke spec. Bonny Light sweetens blend
        sulfur; increase allocation improves HDS throughput margin.
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function CrudeSlate({ t, isDark, tankers = [] }) {
  const [tab, setTab] = useState("Supply Mix");
  return (
    <div style={{ padding: "24px", height: "100%", overflow: "auto" }}>
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
          Crude Slate
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
          Supply mix · vessel schedule · pipeline flows · quality specs
        </div>
      </div>
      <TabBar active={tab} onSelect={setTab} t={t} />
      {tab === "Supply Mix" && <SupplyMixTab t={t} isDark={isDark} />}
      {tab === "Tanker Schedule" && (
        <TankerScheduleTab t={t} tankers={tankers} />
      )}
      {tab === "Pipeline Flows" && <PipelineFlowsTab t={t} isDark={isDark} />}
      {tab === "Crude Quality" && <CrudeQualityTab t={t} />}
    </div>
  );
}
