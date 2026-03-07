/**
 * Theme.js — single source of truth for all color/style tokens
 * Import: import { T, getTheme } from "../shared/Theme";
 */

export const T = {
  light: {
    bg: "#f3f1ee",
    bgCard: "rgba(255,255,255,0.82)",
    bgCardHover: "rgba(255,255,255,0.98)",
    bgSubtle: "rgba(0,0,0,0.03)",
    bgInset: "rgba(0,0,0,0.045)",
    bgOverlay: "rgba(0,0,0,0.35)",
    border: "rgba(0,0,0,0.09)",
    headerBorder: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.15)",
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
    green: "#1a6e48",
    greenSoft: "rgba(26,110,72,0.09)",
    good: "#1a6e48",
    warn: "#9c6010",
    bad: "#b52218",
    offline: "#8a7355",
    shadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.05)",
    shadowLg: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
    toggleBg: "rgba(0,0,0,0.07)",
    grid: "rgba(0,0,0,0.055)",
    ambientA: "rgba(26,83,138,0.05)",
    ambientB: "rgba(10,110,138,0.04)",
    sidebarBg: "rgba(255,255,255,0.92)",
    sidebarBorder: "rgba(0,0,0,0.08)",
    sidebarActive: "rgba(26,83,138,0.1)",
    sidebarActiveText: "#1a538a",
    sidebarText: "#7a6345",
    sidebarHover: "rgba(0,0,0,0.04)",
    tabActive: "rgba(26,83,138,0.11)",
    tabText: "#1a538a",
    tabInactive: "#7a6345",
    liveRing: "rgba(26,83,138,0.2)",
    liveDot: "#1a538a",
    badgeBg: "rgba(26,83,138,0.09)",
    badgeBorder: "rgba(26,83,138,0.22)",
    skeletonBase: "rgba(0,0,0,0.06)",
    skeletonShimmer: "rgba(0,0,0,0.03)",
    modalBg: "rgba(255,255,255,0.97)",
  },
  dark: {
    bg: "#080c12",
    bgCard: "rgba(255,255,255,0.03)",
    bgCardHover: "rgba(255,255,255,0.055)",
    bgSubtle: "rgba(255,255,255,0.025)",
    bgInset: "rgba(255,255,255,0.04)",
    bgOverlay: "rgba(0,0,0,0.6)",
    border: "rgba(255,255,255,0.08)",
    headerBorder: "rgba(255,255,255,0.07)",
    borderStrong: "rgba(255,255,255,0.15)",
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
    green: "#30b870",
    greenSoft: "rgba(48,184,112,0.1)",
    good: "#30b870",
    warn: "#d48820",
    bad: "#e84040",
    offline: "#2a3848",
    shadow: "none",
    shadowLg: "0 8px 40px rgba(0,0,0,0.5)",
    toggleBg: "rgba(255,255,255,0.07)",
    grid: "rgba(255,255,255,0.045)",
    ambientA: "rgba(74,144,216,0.06)",
    ambientB: "rgba(34,176,200,0.05)",
    sidebarBg: "rgba(8,12,22,0.97)",
    sidebarBorder: "rgba(255,255,255,0.07)",
    sidebarActive: "rgba(74,144,216,0.15)",
    sidebarActiveText: "#4a90d8",
    sidebarText: "#4a5e72",
    sidebarHover: "rgba(255,255,255,0.04)",
    tabActive: "rgba(74,144,216,0.18)",
    tabText: "#4a90d8",
    tabInactive: "#4a5e72",
    liveRing: "rgba(74,144,216,0.25)",
    liveDot: "#4a90d8",
    badgeBg: "rgba(74,144,216,0.12)",
    badgeBorder: "rgba(74,144,216,0.28)",
    skeletonBase: "rgba(255,255,255,0.04)",
    skeletonShimmer: "rgba(255,255,255,0.02)",
    modalBg: "rgba(10,14,22,0.98)",
  },
};

export const getTheme = (isDark) => (isDark ? T.dark : T.light);

// Shared chart tick style factory
export const tickStyle = (t) => ({
  fill: t.textMuted,
  fontSize: 10,
  fontFamily: "monospace",
});

// Shared tooltip factory
export const makeTooltip =
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

// Skeleton loader
export const Skeleton = ({ w = "100%", h = 20, r = 6, t }) => (
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
