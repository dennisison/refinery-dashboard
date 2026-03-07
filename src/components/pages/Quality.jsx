/**
 * Quality.jsx
 * Tabs: CARB Gasoline | Diesel & Jet | Sulfur Tracking | Batch Releases
 */
import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FlaskConical,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { makeTooltip, tickStyle } from "../shared/Theme";

const TABS = [
  "CARB Gasoline",
  "Diesel & Jet",
  "Sulfur Tracking",
  "Batch Releases",
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

// Spec indicator component
function SpecRow({ label, value, unit, min, max, target, good, warn, t }) {
  const pct = max
    ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
    : 50;
  const inSpec = good ? good(value) : true;
  const isWarn = warn ? warn(value) : false;
  const color = !inSpec ? t.bad : isWarn ? t.warn : t.good;
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "8px",
        background: t.bgSubtle,
        border: `1px solid ${!inSpec ? t.bad + "30" : isWarn ? t.warn + "20" : t.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: t.textMuted,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {!inSpec ? (
            <XCircle size={11} color={t.bad} />
          ) : isWarn ? (
            <AlertTriangle size={11} color={t.warn} />
          ) : (
            <CheckCircle size={11} color={t.good} />
          )}
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color,
              fontFamily: "monospace",
            }}
          >
            {value}{" "}
            <span
              style={{ fontSize: "10px", fontWeight: 400, color: t.textDim }}
            >
              {unit}
            </span>
          </span>
        </div>
      </div>
      {max && (
        <div
          style={{
            height: "5px",
            borderRadius: "3px",
            background: t.bgInset,
            overflow: "hidden",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: "3px",
              background: color,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{ fontSize: "8px", color: t.textDim, fontFamily: "monospace" }}
        >
          Spec: {min}
          {max ? `–${max}` : `+`} {unit}
        </span>
        {target && (
          <span
            style={{
              fontSize: "8px",
              color: t.textDim,
              fontFamily: "monospace",
            }}
          >
            Target: {target} {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ── CARB GASOLINE TAB ─────────────────────────────────────────────────────────
const RON_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  ron: parseFloat((91.2 + (Math.random() - 0.5) * 0.4).toFixed(2)),
  mon: parseFloat((82.8 + (Math.random() - 0.5) * 0.3).toFixed(2)),
}));
RON_TREND[RON_TREND.length - 1] = { day: "Today", ron: 91.4, mon: 82.9 };

function CARBGasolineTab({ t }) {
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Spec grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
        }}
      >
        <SpecRow
          label="RON"
          value={91.4}
          unit=""
          min={91.0}
          max={93.0}
          target={91.5}
          good={(v) => v >= 91.0}
          warn={(v) => v < 91.2}
          t={t}
        />
        <SpecRow
          label="MON"
          value={82.9}
          unit=""
          min={82.0}
          max={84.0}
          target={83.0}
          good={(v) => v >= 82.0}
          warn={(v) => v < 82.3}
          t={t}
        />
        <SpecRow
          label="RVP"
          value={6.9}
          unit="psi"
          min={0}
          max={7.0}
          target={6.8}
          good={(v) => v <= 7.0}
          warn={(v) => v > 6.8}
          t={t}
        />
        <SpecRow
          label="Sulfur"
          value={18}
          unit="ppm"
          min={0}
          max={30}
          target={15}
          good={(v) => v <= 30}
          warn={(v) => v > 20}
          t={t}
        />
        <SpecRow
          label="Benzene"
          value={0.62}
          unit="vol%"
          min={0}
          max={0.8}
          target={0.6}
          good={(v) => v <= 0.8}
          warn={(v) => v > 0.7}
          t={t}
        />
        <SpecRow
          label="Aromatics"
          value={22.1}
          unit="vol%"
          min={0}
          max={25.0}
          target={22.0}
          good={(v) => v <= 25.0}
          warn={(v) => v > 23.0}
          t={t}
        />
        <SpecRow
          label="Olefins"
          value={4.1}
          unit="vol%"
          min={0}
          max={6.0}
          target={4.0}
          good={(v) => v <= 6.0}
          warn={(v) => v > 5.0}
          t={t}
        />
        <SpecRow
          label="Ethanol"
          value={10.0}
          unit="vol%"
          min={9.5}
          max={10.5}
          target={10.0}
          good={(v) => v >= 9.5 && v <= 10.5}
          warn={(v) => v < 9.7 || v > 10.3}
          t={t}
        />
      </div>

      {/* RON/MON Trend */}
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
          RON / MON 14-Day Trend
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
          CARB Phase 3 minimums: RON 91.0 · MON 82.0
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={RON_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis
              dataKey="day"
              tick={{ ...tk, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={tk}
              axisLine={false}
              tickLine={false}
              domain={[81.5, 93.5]}
            />
            <Tooltip content={<Tip />} />
            <ReferenceLine
              y={91.0}
              stroke={t.bad}
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              label={{
                value: "RON min 91.0",
                fill: t.bad,
                fontSize: 8,
                fontFamily: "monospace",
              }}
            />
            <ReferenceLine
              y={82.0}
              stroke={t.warn}
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              label={{
                value: "MON min 82.0",
                fill: t.warn,
                fontSize: 8,
                fontFamily: "monospace",
              }}
            />
            <Line
              type="monotone"
              dataKey="ron"
              stroke={t.accent}
              strokeWidth={2}
              dot={{ fill: t.accent, r: 3, strokeWidth: 0 }}
              name="RON"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="mon"
              stroke={t.teal}
              strokeWidth={2}
              dot={{ fill: t.teal, r: 3, strokeWidth: 0 }}
              name="MON"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── DIESEL & JET TAB ──────────────────────────────────────────────────────────
function DieselJetTab({ t }) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
    >
      {/* CARB Diesel */}
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: t.good,
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: t.textPrimary,
              fontFamily: "monospace",
            }}
          >
            CARB ULSD
          </span>
          <span
            style={{
              fontSize: "9px",
              color: t.good,
              fontFamily: "monospace",
              background: t.greenSoft,
              padding: "2px 7px",
              borderRadius: "4px",
            }}
          >
            IN SPEC
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SpecRow
            label="Sulfur"
            value={9}
            unit="ppm"
            min={0}
            max={15}
            target={8}
            good={(v) => v <= 15}
            warn={(v) => v > 12}
            t={t}
          />
          <SpecRow
            label="Cetane Index"
            value={47.2}
            unit=""
            min={45}
            max={55}
            target={48}
            good={(v) => v >= 45}
            warn={(v) => v < 46}
            t={t}
          />
          <SpecRow
            label="T90 Distillation"
            value={318}
            unit="°C"
            min={280}
            max={338}
            target={315}
            good={(v) => v <= 338}
            warn={(v) => v > 325}
            t={t}
          />
          <SpecRow
            label="Lubricity HFRR"
            value={298}
            unit="μm"
            min={0}
            max={460}
            target={300}
            good={(v) => v <= 460}
            warn={(v) => v > 400}
            t={t}
          />
        </div>
      </div>

      {/* Jet Fuel */}
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: t.good,
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: t.textPrimary,
              fontFamily: "monospace",
            }}
          >
            Jet A-1 (LAX Pipeline)
          </span>
          <span
            style={{
              fontSize: "9px",
              color: t.good,
              fontFamily: "monospace",
              background: t.greenSoft,
              padding: "2px 7px",
              borderRadius: "4px",
            }}
          >
            IN SPEC
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SpecRow
            label="Flash Point"
            value={41.2}
            unit="°C"
            min={38}
            max={65}
            target={42}
            good={(v) => v >= 38}
            warn={(v) => v < 39}
            t={t}
          />
          <SpecRow
            label="Freeze Point"
            value={-52}
            unit="°C"
            min={-999}
            max={-47}
            target={-50}
            good={(v) => v <= -47}
            warn={(v) => v > -48}
            t={t}
          />
          <SpecRow
            label="Thermal Stability"
            value={24}
            unit="mm JFTOT"
            min={0}
            max={25}
            good={(v) => v <= 25}
            warn={(v) => v > 22}
            t={t}
          />
          <SpecRow
            label="Aromatics"
            value={17.4}
            unit="vol%"
            min={0}
            max={25}
            good={(v) => v <= 25}
            warn={(v) => v > 22}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

// ── SULFUR TRACKING TAB ───────────────────────────────────────────────────────
const SULFUR_DATA = Array.from({ length: 9 }, (_, i) => ({
  wk: i === 8 ? "Now" : `W-${8 - i}`,
  feed: parseFloat((1.6 + Math.random() * 0.25).toFixed(3)),
  carb: parseFloat((0.0016 + Math.random() * 0.0015).toFixed(4)),
  ulsd: parseFloat((0.0007 + Math.random() * 0.0004).toFixed(4)),
}));

function SulfurTrackingTab({ t }) {
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "12px",
        }}
      >
        {[
          {
            label: "Crude Feed Sulfur",
            value: "1.78 wt%",
            sub: "Weighted avg of current slate",
            color: t.warn,
          },
          {
            label: "CARB Gas Sulfur",
            value: "18 ppm",
            sub: "CARB Phase 3 limit: 30 ppm",
            color: t.good,
          },
          {
            label: "ULSD Sulfur",
            value: "9 ppm",
            sub: "Federal limit: 15 ppm",
            color: t.good,
          },
        ].map(({ label, value, sub, color }) => (
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
                fontSize: "24px",
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
              }}
            >
              {sub}
            </div>
          </div>
        ))}
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
          Crude Feed vs. Product Sulfur — 9 Weeks
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
          Feed sulfur wt% (left axis) · Product sulfur ppm ÷ 1000 (right axis)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={SULFUR_DATA}
            margin={{ top: 4, right: 40, bottom: 0, left: -16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis
              dataKey="wk"
              tick={{ ...tk, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={tk}
              axisLine={false}
              tickLine={false}
              domain={[1.4, 2.0]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={tk}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<Tip />} />
            <ReferenceLine
              yAxisId="right"
              y={0.003}
              stroke={t.bad}
              strokeDasharray="4 3"
              label={{
                value: "CARB 30ppm",
                fill: t.bad,
                fontSize: 8,
                fontFamily: "monospace",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="feed"
              stroke={t.warn}
              strokeWidth={2}
              dot={{ fill: t.warn, r: 3, strokeWidth: 0 }}
              name="Feed wt%"
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="carb"
              stroke={t.accent}
              strokeWidth={2}
              dot={{ fill: t.accent, r: 3, strokeWidth: 0 }}
              name="CARB ppm/1k"
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ulsd"
              stroke={t.teal}
              strokeWidth={2}
              dot={{ fill: t.teal, r: 3, strokeWidth: 0 }}
              name="ULSD ppm/1k"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── BATCH RELEASES TAB ────────────────────────────────────────────────────────
const BATCHES = [
  {
    id: "B-2025-0441",
    product: "CARB 91 Regular",
    vol: "180k bbl",
    released: "Today 07:22",
    status: "released",
    ron: 91.4,
    sulfur: 18,
    dest: "Pipeline — LA Basin",
  },
  {
    id: "B-2025-0440",
    product: "CARB ULSD",
    vol: "95k bbl",
    released: "Today 04:10",
    status: "released",
    ron: null,
    sulfur: 9,
    dest: "Pipeline — NV/AZ",
  },
  {
    id: "B-2025-0439",
    product: "Jet A-1",
    vol: "42k bbl",
    released: "Yesterday 21:00",
    status: "released",
    ron: null,
    sulfur: null,
    dest: "LAX Pipeline",
  },
  {
    id: "B-2025-0438",
    product: "CARB 91 Regular",
    vol: "175k bbl",
    released: "Yesterday 14:45",
    status: "released",
    ron: 91.3,
    sulfur: 21,
    dest: "Rack — wholesale",
  },
  {
    id: "B-2025-0442",
    product: "CARB 87 Regular",
    vol: "160k bbl",
    released: null,
    status: "pending",
    ron: null,
    sulfur: null,
    dest: "Pipeline — LA Basin",
  },
  {
    id: "B-2025-0443",
    product: "Fuel Coke (Anode)",
    vol: "28k MT",
    released: null,
    status: "testing",
    ron: null,
    sulfur: null,
    dest: "Rail — Port export",
  },
];

function BatchReleasesTab({ t }) {
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
          { label: "Released Today", value: 2, color: t.good },
          { label: "Pending QC", value: 1, color: t.warn },
          { label: "In Testing", value: 1, color: t.blue },
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
                fontSize: "28px",
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
            Product Batch Release Log
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.6fr 0.6fr 1fr 0.8fr",
            padding: "8px 18px",
            background: t.bgSubtle,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {[
            "Batch ID",
            "Product",
            "Volume",
            "Released",
            "RON",
            "S ppm",
            "Destination",
            "Status",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "8px",
                color: t.textDim,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {BATCHES.map((b, i) => {
          const sc =
            b.status === "released"
              ? t.good
              : b.status === "pending"
                ? t.warn
                : t.blue;
          return (
            <div
              key={b.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1.2fr 0.8fr 0.8fr 0.6fr 0.6fr 1fr 0.8fr",
                padding: "11px 18px",
                alignItems: "center",
                background: i % 2 === 0 ? "transparent" : t.bgSubtle,
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: t.accent,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {b.id}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {b.product}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textSecondary,
                  fontFamily: "monospace",
                }}
              >
                {b.vol}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: b.released ? t.textSecondary : t.textDim,
                  fontFamily: "monospace",
                }}
              >
                {b.released || "—"}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {b.ron ?? "—"}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {b.sulfur ?? "—"}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: t.textSecondary,
                  fontFamily: "monospace",
                }}
              >
                {b.dest}
              </span>
              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: "4px",
                  width: "fit-content",
                  background: `${sc}14`,
                  border: `1px solid ${sc}28`,
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: sc,
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {b.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function Quality({ t, isDark }) {
  const [tab, setTab] = useState("CARB Gasoline");
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
          Quality & Compliance
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
          CARB specs · RON/MON tracking · sulfur compliance · batch releases
        </div>
      </div>
      <TabBar active={tab} onSelect={setTab} t={t} />
      {tab === "CARB Gasoline" && <CARBGasolineTab t={t} />}
      {tab === "Diesel & Jet" && <DieselJetTab t={t} />}
      {tab === "Sulfur Tracking" && <SulfurTrackingTab t={t} />}
      {tab === "Batch Releases" && <BatchReleasesTab t={t} />}
    </div>
  );
}
