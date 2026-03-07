/**
 * AppShell.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Master layout. Owns all data hooks + routing.
 * All data flows down as props — no child calls useRefineryData().
 */

import { useState } from "react";
import { getTheme } from "./shared/Theme";
import Sidebar from "./layout/Sidebar";
import KPIModal from "./shared/KPIModal";
import useNavigation, { PAGES } from "../hooks/useNavigation.jsx";
import useRefineryData from "../hooks/useRefineryData.jsx";

import Overview from "./pages/Overview";
import UnitsDetail from "./pages/UnitsDetail";
import CrudeSlate from "./pages/CrudeSlate";
import Quality from "./pages/Quality";
import Markets from "./pages/Markets";
import Corrosion from "./pages/Corrosion";

export default function AppShell() {
  const [isDark, setIsDark] = useState(false);
  const t = getTheme(isDark);
  const nav = useNavigation();

  const {
    kpis,
    units,
    alerts,
    wsStatus,
    wsLatency,
    wsClients,
    throughput,
    yield: yieldData,
    production,
    margins,
    crudeSlate,
    tankers,
    lab,
    corrosion,
    corrosionDetail,
    fetchCorrosionUnit,
    forceCorrosionRefresh,
    loading,
    error,
    getDelta,
    refresh,
  } = useRefineryData();

  // Derive a stable lastUpdated from kpis (ticked by WS)
  // keep it as a Date object so callers can use time methods directly
  const lastUpdated = kpis?.crudeThroughput?.value != null ? new Date() : null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: t.bg,
        color: t.textPrimary,
        fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* ── SIDEBAR ── */}
      <Sidebar
        page={nav.page}
        onNavigate={nav.goTo}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        alertCount={alerts.length}
        t={t}
      />

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── WS STATUS BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "4px 16px",
            background: t.bgCard,
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background:
                wsStatus === "connected"
                  ? "#2ecc71"
                  : wsStatus === "connecting"
                    ? "#f39c12"
                    : wsStatus === "error"
                      ? "#e74c3c"
                      : "#888",
              boxShadow: wsStatus === "connected" ? "0 0 6px #2ecc71" : "none",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              color: t.textDim,
              fontFamily: "monospace",
            }}
          >
            {wsStatus === "connected"
              ? `WS LIVE${wsLatency ? ` · ${wsLatency}ms` : ""}${wsClients > 1 ? ` · ${wsClients} clients` : ""}`
              : wsStatus === "connecting"
                ? "WS CONNECTING..."
                : wsStatus === "error"
                  ? "WS ERROR · RETRYING"
                  : "WS DISCONNECTED · RETRYING"}
          </span>
          {lastUpdated && (
            <span
              style={{
                fontSize: "9px",
                color: t.textDim,
                fontFamily: "monospace",
              }}
            >
              · {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Ambient gradient (overview only) */}
        {nav.page === PAGES.OVERVIEW && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-15%",
                right: "40%",
                width: "500px",
                height: "500px",
                background: `radial-gradient(circle, ${t.ambientA} 0%, transparent 65%)`,
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-10%",
                right: "-5%",
                width: "400px",
                height: "400px",
                background: `radial-gradient(circle, ${t.ambientB} 0%, transparent 65%)`,
                borderRadius: "50%",
              }}
            />
            <svg
              width="100%"
              height="100%"
              style={{
                opacity: isDark ? 0.02 : 0.03,
                position: "absolute",
                inset: 0,
              }}
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
        )}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {nav.page === PAGES.OVERVIEW && (
            <Overview
              kpis={kpis}
              throughput={throughput}
              yieldData={yieldData}
              units={units}
              alerts={alerts}
              crudeSlate={crudeSlate}
              margins={margins}
              production={production}
              corrosion={corrosion}
              loading={loading}
              lastUpdated={lastUpdated}
              getDelta={getDelta}
              refresh={refresh}
              isDark={isDark}
              t={t}
              onKpiClick={nav.openKpiModal}
              onUnitClick={nav.openUnit}
              onAlertClick={nav.jumpFromAlert}
              onNavigate={nav.goTo}
            />
          )}

          {nav.page === PAGES.UNITS && (
            <UnitsDetail
              units={units}
              loading={loading}
              activeUnit={nav.activeUnit}
              onSelectUnit={nav.openUnit}
              onBack={nav.closeUnit}
              isDark={isDark}
              t={t}
            />
          )}

          {nav.page === PAGES.CRUDE && (
            <CrudeSlate t={t} isDark={isDark} tankers={tankers} />
          )}

          {nav.page === PAGES.QUALITY && <Quality t={t} isDark={isDark} />}

          {nav.page === PAGES.MARKETS && <Markets t={t} isDark={isDark} />}

          {nav.page === PAGES.CORROSION && (
            <Corrosion
              t={t}
              isDark={isDark}
              corrosion={corrosion}
              units={units}
              onUnitClick={nav.openUnit}
            />
          )}
        </div>
      </main>

      {nav.kpiModal && (
        <KPIModal
          kpiKey={nav.kpiModal}
          kpis={kpis}
          onClose={nav.closeKpiModal}
          isDark={isDark}
          t={t}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes lp      { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        button { font-family:inherit; }
        button:focus { outline:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(26,83,138,0.25); border-radius:4px; }
      `}</style>
    </div>
  );
}
