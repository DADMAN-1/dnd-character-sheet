import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useState } from "react";
import type { Page } from "../App";
import { useDarkMode } from "../context/DarkModeContext";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  onOpenSearch: () => void;
}

type NavGroup = {
  label: string;
  items: { label: string; p: Page; emoji: string }[];
};

export default function NavBar({ page, setPage, onOpenSearch }: Props) {
  const { clear } = useInternetIdentity();
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: "Core",
      items: [
        { label: "Characters", p: { name: "list" }, emoji: "🧙" },
        { label: "Armies", p: { name: "armies" }, emoji: "⚔️" },
        { label: "Rank Reference", p: { name: "rank_reference" }, emoji: "🎖️" },
        { label: "Settings", p: { name: "settings" }, emoji: "⚙️" },
      ],
    },
    {
      label: "World",
      items: [
        { label: "World", p: { name: "world" }, emoji: "🌍" },
        { label: "Campaign", p: { name: "campaign" }, emoji: "🏰" },
        { label: "Party", p: { name: "party" }, emoji: "🛡️" },
      ],
    },
  ];

  const allItems = navGroups.flatMap((g) => g.items);

  return (
    <>
      {/* Responsive nav styles injected into head via a style tag */}
      <style>{`
        .ds-nav-desktop { display: flex; }
        .ds-nav-mobile-toggle { display: none !important; }
        .ds-nav-darkmode-label { display: inline; }
        .ds-nav-desktop-only { display: inline-flex; }
        .ds-nav-search-hint { display: inline; }
        @media (max-width: 768px) {
          .ds-nav-desktop { display: none !important; }
          .ds-nav-mobile-toggle { display: flex !important; }
          .ds-nav-darkmode-label { display: none; }
          .ds-nav-desktop-only { display: none !important; }
          .ds-nav-search-hint { display: none; }
        }
        @media (min-width: 769px) and (max-width: 1100px) {
          .ds-nav-desktop button {
            padding: 8px 6px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "var(--ds-surface)",
          borderBottom: "1px solid var(--ds-border)",
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 24 }}>🐉</span>
          <span
            className="font-cinzel"
            style={{
              color: "var(--ds-gold)",
              fontSize: 18,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            DungeonScribe
          </span>
        </div>

        {/* Desktop nav — hidden on mobile via .ds-nav-desktop */}
        <div
          className="ds-nav-desktop"
          style={{
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
            flexWrap: "nowrap",
            overflow: "visible",
            minWidth: 0,
          }}
        >
          {navGroups.map((group) => (
            <div
              key={group.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                flexShrink: 0,
              }}
            >
              {/* Divider between groups */}
              {group.label === "World" && (
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "var(--ds-border)",
                    margin: "0 8px",
                  }}
                />
              )}
              {group.items.map(({ label, p }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setPage(p)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color:
                      page.name === p.name
                        ? "var(--ds-gold)"
                        : "var(--ds-muted)",
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    borderBottom:
                      page.name === p.name
                        ? "2px solid var(--ds-gold)"
                        : "2px solid transparent",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  data-ocid={`nav.${label.toLowerCase()}.link`}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Right controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {/* Search button — always visible */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search everything (Ctrl+K)"
            aria-label="Open global search"
            style={{
              background: "transparent",
              border: "1px solid var(--ds-border)",
              color: "var(--ds-muted)",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 15,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
            data-ocid="nav.search.button"
          >
            <span>🔍</span>
            <span
              className="ds-nav-search-hint"
              style={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
            >
              Ctrl+K
            </span>
          </button>

          {/* Dark mode toggle — hidden on mobile (also in mobile dropdown) */}
          <button
            type="button"
            onClick={toggle}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="ds-nav-desktop-only"
            style={{
              background: "transparent",
              border: "1px solid var(--ds-border)",
              color: "var(--ds-muted)",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              alignItems: "center",
              gap: 5,
            }}
            data-ocid="nav.darkmode.toggle"
          >
            <span>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}>
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          {/* Sign out — hidden on mobile (also in mobile dropdown) */}
          <button
            type="button"
            onClick={clear}
            className="ds-nav-desktop-only"
            style={{
              background: "transparent",
              border: "1px solid var(--ds-border)",
              color: "var(--ds-muted)",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
            data-ocid="nav.signout.button"
          >
            Sign Out
          </button>

          {/* Mobile hamburger — hidden on desktop via .ds-nav-mobile-toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="ds-nav-mobile-toggle"
            style={{
              background: menuOpen ? "var(--ds-border)" : "transparent",
              border: "1px solid var(--ds-border)",
              color: "var(--ds-muted)",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
            data-ocid="nav.menu.toggle"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              right: 0,
              backgroundColor: "var(--ds-surface)",
              borderBottom: "1px solid var(--ds-border)",
              padding: "8px 0",
              zIndex: 100,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}
            data-ocid="nav.mobile.menu"
          >
            {/* Mobile search button */}
            <button
              type="button"
              onClick={() => {
                onOpenSearch();
                setMenuOpen(false);
              }}
              style={{
                display: "flex",
                width: "100%",
                padding: "12px 20px",
                background: "transparent",
                border: "none",
                borderLeft: "3px solid transparent",
                color: "var(--ds-text)",
                cursor: "pointer",
                fontSize: 15,
                fontFamily: "Inter, sans-serif",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
              }}
              data-ocid="nav.mobile.search.button"
            >
              <span style={{ fontSize: 18 }}>🔍</span>
              <span>Search Everything</span>
            </button>
            {allItems.map(({ label, p, emoji }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setPage(p);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  padding: "12px 20px",
                  background:
                    page.name === p.name
                      ? "rgba(var(--ds-gold-rgb, 180,140,60),0.08)"
                      : "transparent",
                  border: "none",
                  borderLeft:
                    page.name === p.name
                      ? "3px solid var(--ds-gold)"
                      : "3px solid transparent",
                  color:
                    page.name === p.name ? "var(--ds-gold)" : "var(--ds-text)",
                  cursor: "pointer",
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                }}
                data-ocid={`nav.mobile.${label.toLowerCase()}.link`}
              >
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}

            {/* Mobile-only: dark mode + sign out in dropdown footer */}
            <div
              style={{
                borderTop: "1px solid var(--ds-border)",
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                gap: 8,
                padding: "8px 20px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  toggle();
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid var(--ds-border)",
                  color: "var(--ds-muted)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontFamily: "Inter, sans-serif",
                }}
                data-ocid="nav.mobile.darkmode.toggle"
              >
                <span>{isDark ? "☀️" : "🌙"}</span>
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid var(--ds-border)",
                  color: "var(--ds-muted)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontFamily: "Inter, sans-serif",
                }}
                data-ocid="nav.mobile.signout.button"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
