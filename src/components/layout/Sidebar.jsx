/**
 * Sidebar.jsx — persistent left navigation rail
 */
import {
  LayoutDashboard,
  Factory,
  Droplets,
  FlaskConical,
  TrendingUp,
  ShieldAlert,
  Sun,
  Moon,
  Bell,
  Settings,
} from "lucide-react";
import { PAGES } from "../../hooks/useNavigation.jsx";

const NAV_ITEMS = [
  { page: PAGES.OVERVIEW, label: "Overview", icon: LayoutDashboard },
  { page: PAGES.UNITS, label: "Units", icon: Factory },
  { page: PAGES.CRUDE, label: "Crude Slate", icon: Droplets },
  { page: PAGES.QUALITY, label: "Quality", icon: FlaskConical },
  { page: PAGES.MARKETS, label: "Markets", icon: TrendingUp },
  { page: PAGES.CORROSION, label: "Corrosion", icon: ShieldAlert },
];

export default function Sidebar({
  page,
  onNavigate,
  isDark,
  onToggleTheme,
  alertCount,
  t,
}) {
  return (
    <div
      style={{
        width: "200px",
        flexShrink: 0,
        background: t.sidebarBg,
        borderRight: `1px solid ${t.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(12px)",
        transition: "background 0.3s",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: `1px solid ${t.sidebarBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              flexShrink: 0,
              background: `linear-gradient(140deg, ${t.accent}, ${t.accentDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 14px ${t.accentGlow}`,
            }}
          >
            <Factory size={17} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: t.textPrimary,
                fontFamily: "monospace",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
              }}
            >
              LA REFINERY
            </div>
            <div
              style={{
                fontSize: "8px",
                color: t.textMuted,
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              OPS DASHBOARD
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <div
          style={{
            fontSize: "8px",
            color: t.textDim,
            fontFamily: "monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "8px 8px 4px",
          }}
        >
          Navigation
        </div>

        {NAV_ITEMS.map(({ page: p, label, icon: Icon }) => {
          const active = page === p;
          return (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                background: active ? t.sidebarActive : "transparent",
                transition: "background 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = t.sidebarHover;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Active indicator bar */}
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "3px",
                    borderRadius: "0 3px 3px 0",
                    background: t.accent,
                  }}
                />
              )}
              <Icon
                size={15}
                color={active ? t.sidebarActiveText : t.sidebarText}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: active ? t.sidebarActiveText : t.sidebarText,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>

              {/* Alert badge on Overview */}
              {p === PAGES.OVERVIEW && alertCount > 0 && (
                <div
                  style={{
                    marginLeft: "auto",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9px",
                    background: t.warn,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: "white",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    padding: "0 5px",
                  }}
                >
                  {alertCount}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div
        style={{
          padding: "10px 8px 16px",
          borderTop: `1px solid ${t.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            width: "100%",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = t.sidebarHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {isDark ? (
            <Sun size={15} color={t.sidebarText} />
          ) : (
            <Moon size={15} color={t.sidebarText} />
          )}
          <span
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: t.sidebarText,
            }}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            width: "100%",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = t.sidebarHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Settings size={15} color={t.sidebarText} />
          <span
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: t.sidebarText,
            }}
          >
            Settings
          </span>
        </button>

        {/* Version / info */}
        <div
          style={{
            padding: "8px 10px 0",
            fontSize: "8px",
            color: t.textDim,
            fontFamily: "monospace",
            lineHeight: 1.6,
          }}
        >
          365 KBPD · CARB Phase 3<br />
          South Coast AQMD
          <br />
          API: localhost:3001
        </div>
      </div>
    </div>
  );
}
