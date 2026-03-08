/**
 * Markets.jsx
 * Tabs: Crack Spreads | Product Pricing | Regional Demand | Margin Breakdown
 */
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  "Crack Spreads",
  "Product Pricing",
  "Regional Demand",
  "Margin Breakdown",
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

// 24 months of crack spread history
const CRACK_HISTORY = [
  { mo: "Apr'23", wc321: 28.4, gulf321: 22.1, wc211: 18.2 },
  { mo: "May'23", wc321: 31.2, gulf321: 24.8, wc211: 20.1 },
  { mo: "Jun'23", wc321: 26.8, gulf321: 21.4, wc211: 17.4 },
  { mo: "Jul'23", wc321: 29.1, gulf321: 23.6, wc211: 18.9 },
  { mo: "Aug'23", wc321: 27.4, gulf321: 22.0, wc211: 17.8 },
  { mo: "Sep'23", wc321: 24.8, gulf321: 20.1, wc211: 16.2 },
  { mo: "Oct'23", wc321: 21.4, gulf321: 18.4, wc211: 14.0 },
  { mo: "Nov'23", wc321: 19.6, gulf321: 16.2, wc211: 12.8 },
  { mo: "Dec'23", wc321: 16.2, gulf321: 13.8, wc211: 10.4 },
  { mo: "Jan'24", wc321: 18.8, gulf321: 15.4, wc211: 12.2 },
  { mo: "Feb'24", wc321: 22.4, gulf321: 18.0, wc211: 14.6 },
  { mo: "Mar'24", wc321: 24.2, gulf321: 19.8, wc211: 15.8 },
  { mo: "Apr'24", wc321: 26.8, gulf321: 21.6, wc211: 17.4 },
  { mo: "May'24", wc321: 28.1, gulf321: 23.2, wc211: 18.4 },
  { mo: "Jun'24", wc321: 25.4, gulf321: 20.8, wc211: 16.6 },
  { mo: "Jul'24", wc321: 27.2, gulf321: 22.4, wc211: 17.8 },
  { mo: "Aug'24", wc321: 24.8, gulf321: 20.1, wc211: 16.2 },
  { mo: "Sep'24", wc321: 21.4, gulf321: 17.6, wc211: 14.0 },
  { mo: "Oct'24", wc321: 19.6, gulf321: 16.2, wc211: 12.8 },
  { mo: "Nov'24", wc321: 16.2, gulf321: 13.4, wc211: 10.4 },
  { mo: "Dec'24", wc321: 14.1, gulf321: 11.8, wc211: 9.2 },
  { mo: "Jan'25", wc321: 17.8, gulf321: 14.6, wc211: 11.6 },
  { mo: "Feb'25", wc321: 19.2, gulf321: 15.8, wc211: 12.6 },
  { mo: "Mar'25", wc321: 18.7, gulf321: 15.2, wc211: 12.2 },
];

// Product pricing $/bbl spot
const PRICING = [
  {
    product: "CARB 91 Regular",
    price: 98.4,
    change: +1.2,
    cost: 79.7,
    margin: 18.7,
    unit: "$/bbl",
  },
  {
    product: "CARB ULSD",
    price: 102.8,
    change: -0.85,
    cost: 81.9,
    margin: 20.9,
    unit: "$/bbl",
  },
  {
    product: "Jet A-1 (LAX)",
    price: 97.2,
    change: +0.45,
    cost: 80.1,
    margin: 17.1,
    unit: "$/bbl",
  },
  {
    product: "CARB 87 Regular",
    price: 94.6,
    change: +0.9,
    cost: 79.7,
    margin: 14.9,
    unit: "$/bbl",
  },
  {
    product: "Fuel Coke",
    price: 42.0,
    change: -1.2,
    cost: 18.4,
    margin: 23.6,
    unit: "$/MT",
  },
  {
    product: "Anode Coke",
    price: 310.0,
    change: +4.5,
    cost: 18.4,
    margin: 291.6,
    unit: "$/MT",
  },
  {
    product: "LPG / Propane",
    price: 38.2,
    change: -0.3,
    cost: 24.8,
    margin: 13.4,
    unit: "$/bbl",
  },
  {
    product: "Chem-Grade Propylene",
    price: 540.0,
    change: +12.0,
    cost: 80.0,
    margin: 460.0,
    unit: "$/MT",
  },
];

// Regional demand index (indexed, 100 = baseline)
const REGIONAL_DEMAND = [
  { region: "Los Angeles Basin", gasoline: 108, diesel: 102, jet: 118 },
  { region: "San Francisco Bay", gasoline: 96, diesel: 88, jet: 105 },
  { region: "San Diego / Imperial", gasoline: 104, diesel: 98, jet: 112 },
  { region: "Central Valley", gasoline: 92, diesel: 115, jet: 82 },
  { region: "Nevada / Las Vegas", gasoline: 112, diesel: 106, jet: 124 },
  { region: "Phoenix / AZ", gasoline: 105, diesel: 109, jet: 116 },
];

// Margin waterfall data $/bbl crude
const WATERFALL = [
  { label: "Crude Cost", value: -81.6, color: "#b52218", type: "cost" },
  { label: "CARB Gas Rev", value: +46.2, color: "#1a538a", type: "rev" },
  { label: "ULSD Rev", value: +22.8, color: "#1a4e8a", type: "rev" },
  { label: "Jet Fuel Rev", value: +8.4, color: "#0a6e8a", type: "rev" },
  { label: "Coke / LPG Rev", value: +4.8, color: "#6040a0", type: "rev" },
  { label: "Energy / Util", value: -4.2, color: "#9c6010", type: "cost" },
  { label: "Operating Cost", value: -8.4, color: "#b52218", type: "cost" },
  { label: "Net Margin", value: +18.7, color: "#1a6e48", type: "margin" },
];

// ── CRACK SPREADS TAB ─────────────────────────────────────────────────────────
function CrackSpreadsTab({ t, isDark }) {
  const Tip = makeTooltip(t);
  const tk = tickStyle(t);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
        }}
      >
        {[
          {
            label: "WC 3-2-1 Spread",
            value: "$18.7",
            change: "-$0.5",
            pos: false,
            color: t.accent,
          },
          {
            label: "WC 2-1-1 Spread",
            value: "$12.2",
            change: "+$0.3",
            pos: true,
            color: t.blue,
          },
          {
            label: "Gulf 3-2-1",
            value: "$15.2",
            change: "-$0.2",
            pos: false,
            color: t.teal,
          },
          {
            label: "WC Premium",
            value: "+$3.5",
            change: "vs Gulf",
            pos: true,
            color: t.purple,
          },
        ].map(({ label, value, change, pos, color }) => (
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
                fontSize: "26px",
                fontWeight: 700,
                color,
                fontFamily: "monospace",
                marginBottom: "4px",
              }}
            >
              {value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {pos ? (
                <TrendingUp size={11} color={t.good} />
              ) : (
                <TrendingDown size={11} color={t.bad} />
              )}
              <span
                style={{
                  fontSize: "10px",
                  color: pos ? t.good : t.bad,
                  fontFamily: "monospace",
                }}
              >
                {change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 24-month chart */}
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
          Crack Spread History — 24 Months
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
          $/bbl · WC 3-2-1 · WC 2-1-1 · Gulf Coast 3-2-1
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={CRACK_HISTORY}
            margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis
              dataKey="mo"
              tick={{ ...tk, fontSize: 8 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis tick={tk} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <ReferenceLine
              y={16}
              stroke={t.warn}
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              label={{
                value: "Typical breakeven",
                fill: t.warn,
                fontSize: 8,
                fontFamily: "monospace",
              }}
            />
            <Line
              type="monotone"
              dataKey="wc321"
              stroke={t.accent}
              strokeWidth={2.5}
              dot={false}
              name="WC 3-2-1"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="wc211"
              stroke={t.teal}
              strokeWidth={1.5}
              dot={false}
              name="WC 2-1-1"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="gulf321"
              stroke={t.blue}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              name="Gulf 3-2-1"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── PRODUCT PRICING TAB ───────────────────────────────────────────────────────
function ProductPricingTab({ t }) {
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
            Product Spot Prices &amp; Margins
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
            Indicative West Coast spot values · $/bbl or $/MT as noted
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr",
            padding: "8px 18px",
            background: t.bgSubtle,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {["Product", "Price", "vs Prior", "Crude Cost", "Margin", "Unit"].map(
            (h) => (
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
            ),
          )}
        </div>
        {PRICING.map((p, i) => {
          const mc = p.margin > 30 ? t.good : p.margin > 15 ? t.accent : t.warn;
          return (
            <div
              key={p.product}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr",
                padding: "12px 18px",
                alignItems: "center",
                background: i % 2 === 0 ? "transparent" : t.bgSubtle,
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {p.product}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: t.textPrimary,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                ${p.price.toFixed(2)}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                {p.change >= 0 ? (
                  <TrendingUp size={10} color={t.good} />
                ) : (
                  <TrendingDown size={10} color={t.bad} />
                )}
                <span
                  style={{
                    fontSize: "10px",
                    color: p.change >= 0 ? t.good : t.bad,
                    fontFamily: "monospace",
                  }}
                >
                  {p.change > 0 ? "+" : ""}
                  {p.change.toFixed(2)}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: t.textSecondary,
                  fontFamily: "monospace",
                }}
              >
                ${p.cost.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: mc,
                  fontFamily: "monospace",
                }}
              >
                ${p.margin.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: t.textDim,
                  fontFamily: "monospace",
                }}
              >
                {p.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── REGIONAL DEMAND TAB ───────────────────────────────────────────────────────
function RegionalDemandTab({ t, isDark }) {
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
          Regional Demand Index by Market
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
          Index 100 = normal baseline · Gasoline · Diesel · Jet
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={REGIONAL_DEMAND}
            margin={{ top: 0, right: 0, bottom: 60, left: -16 }}
            barGap={2}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis
              dataKey="region"
              tick={{ ...tk, fontSize: 8 }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={tk}
              axisLine={false}
              tickLine={false}
              domain={[75, 135]}
            />
            <Tooltip content={<Tip />} />
            <ReferenceLine y={100} stroke={t.textDim} strokeDasharray="4 3" />
            <Bar
              dataKey="gasoline"
              fill={t.accent}
              name="Gasoline Index"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="diesel"
              fill={t.blue}
              name="Diesel Index"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="jet"
              fill={t.teal}
              name="Jet Index"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "8px",
          background: t.accentSoft,
          border: `1px solid ${t.accent}25`,
          fontSize: "10px",
          color: t.textSecondary,
          fontFamily: "monospace",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: t.textPrimary }}>Insight:</strong> Nevada / Las
        Vegas showing above-baseline demand across all products (+12–24% vs
        baseline). LA Basin jet demand elevated (+18%) aligned with increased
        LAX throughput. Central Valley diesel demand strong (+15%) — align
        DCK-1/2 yield to maximize ULSD vs coke split.
      </div>
    </div>
  );
}

// ── MARGIN BREAKDOWN TAB ──────────────────────────────────────────────────────
function MarginBreakdownTab({ t, isDark }) {
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
            label: "Gross Margin",
            value: "$18.70/bbl",
            sub: "Realized today",
            color: t.good,
          },
          {
            label: "Cash Cost",
            value: "$12.60/bbl",
            sub: "Excl. depreciation",
            color: t.warn,
          },
          {
            label: "Net Cash Margin",
            value: "$6.10/bbl",
            sub: "After full opex",
            color: t.accent,
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
          Margin Waterfall — $/bbl crude processed
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
          Revenue by product stream minus crude cost and operating expenses
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={WATERFALL}
            margin={{ top: 0, right: 0, bottom: 40, left: -16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis
              dataKey="label"
              tick={{ ...tk, fontSize: 8 }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={tk} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <ReferenceLine y={0} stroke={t.borderStrong} />
            <Bar dataKey="value" name="$/bbl" radius={[4, 4, 0, 0]}>
              {WATERFALL.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function Markets({ t, isDark }) {
  const [tab, setTab] = useState("Crack Spreads");
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
          Markets &amp; Margins
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
          Crack spreads · product pricing · regional demand · margin breakdown
        </div>
      </div>
      <TabBar active={tab} onSelect={setTab} t={t} />
      {tab === "Crack Spreads" && <CrackSpreadsTab t={t} isDark={isDark} />}
      {tab === "Product Pricing" && <ProductPricingTab t={t} />}
      {tab === "Regional Demand" && <RegionalDemandTab t={t} isDark={isDark} />}
      {tab === "Margin Breakdown" && (
        <MarginBreakdownTab t={t} isDark={isDark} />
      )}
    </div>
  );
}
