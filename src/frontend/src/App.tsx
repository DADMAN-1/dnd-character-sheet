import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect, useRef, useState } from "react";
import { createActorProxy } from "./actorProxy";
import type { CreateActorOptions } from "./backend";
import { createActor as _createActorRaw } from "./backend";
import type { ExternalBlob } from "./backend";
import { ErrorBoundary } from "./components/ErrorBoundary";
import GlobalSearch from "./components/GlobalSearch";
import NavBar from "./components/NavBar";
import { DarkModeProvider } from "./context/DarkModeContext";
import ArmyDetailPage from "./pages/ArmyDetailPage";
import ArmyListPage from "./pages/ArmyListPage";
import CampaignPage from "./pages/CampaignPage";
import CharacterListPage from "./pages/CharacterListPage";
import CharacterSheetPage from "./pages/CharacterSheetPage";
import LoginPage from "./pages/LoginPage";
import PartyPage from "./pages/PartyPage";
import RankReferencePage from "./pages/RankReferencePage";
import SettingsPage from "./pages/SettingsPage";
import WorldPage from "./pages/WorldPage";
import type { DndBackend } from "./types";

// Safe wrapper: makes _initializeAccessControl() non-throwing so useActor never
// fails due to an access-control error on the Internet Computer.
function createActor(
  canisterId: string,
  uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {},
) {
  const backend = _createActorRaw(
    canisterId,
    uploadFile,
    downloadFile,
    options,
  );
  const original = backend._initializeAccessControl.bind(backend);
  backend._initializeAccessControl = async () => {
    try {
      await original();
    } catch (err) {
      console.warn(
        "[DungeonScribe] _initializeAccessControl failed (non-fatal):",
        err,
      );
    }
  };
  return backend;
}

export type Page =
  | { name: "list" }
  | { name: "sheet"; characterId: bigint }
  | { name: "settings" }
  | { name: "armies" }
  | { name: "army"; armyId: string }
  | { name: "world" }
  | { name: "campaign" }
  | { name: "party" }
  | { name: "rank_reference" };

function StatusLine({
  label,
  ok,
  detail,
}: { label: string; ok: boolean; detail: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: ok ? "#4ade80" : "#f87171",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{ok ? "✓" : "✗"}</span>
        <span>{detail}</span>
      </span>
    </div>
  );
}

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const [page, setPage] = useState<Page>({ name: "list" });
  const [searchOpen, setSearchOpen] = useState(false);
  // timedOut fires only when user is logged in but actor never becomes available
  const [timedOut, setTimedOut] = useState(false);
  // lastError tracks any connection error message for the status page
  const [lastError, setLastError] = useState<string | null>(null);
  // retryKey increments when the user clicks "Restart Connection" — forces the
  // timer effect to re-evaluate so a fresh 30s clock can start.
  const [retryKey, setRetryKey] = useState(0);
  // timerStartedRef ensures we only start the timeout clock ONCE per login session.
  // It must never reset when isInitializing cycles true→false→true during actor setup.
  const timerStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global keyboard shortcuts — must be before any early returns (Rules of Hooks)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K — open global search (works from anywhere, including inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
        return;
      }
      const tag = (
        document.activeElement as HTMLElement
      )?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          setPage({ name: "settings" });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine login state
  const isLoggedIn = identity != null && !identity.getPrincipal().isAnonymous();

  // Reset the timer ref when the user logs out or the actor arrives successfully.
  // We do NOT reset on isInitializing changes — that is the source of the old deadlock.
  // biome-ignore lint/correctness/useExhaustiveDependencies: isInitializing intentionally excluded to prevent deadlock — see comment; retryKey intentionally included to allow restart
  useEffect(() => {
    if (!isLoggedIn) {
      // User logged out: cancel any pending timer and reset state
      timerStartedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setTimedOut(false);
      setLastError(null);
      return;
    }
    if (actor) {
      // Actor arrived: cancel any pending timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setTimedOut(false);
      return;
    }
    // Logged in, no actor yet — start the 30-second clock ONCE per retryKey cycle.
    // IMPORTANT: When retryKey changes (Restart Connection clicked), timerStartedRef
    // is reset to false by handleRestartConnection, so we unconditionally start the
    // timer here without checking isInitializing — this avoids a stale-closure bug
    // where isInitializing (excluded from deps) could prevent the timer from starting.
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      timerRef.current = setTimeout(() => {
        setTimedOut(true);
        setLastError(
          "Actor did not become available within 30 seconds after initialization completed.",
        );
      }, 30000);
    }
    // NOTE: intentionally NOT listing isInitializing as a dep that resets the timer.
    // The timer starts once per retryKey cycle — retryKey is included so that clicking
    // "Restart Connection" re-arms the timer by resetting timerStartedRef.current=false
    // and incrementing retryKey, forcing this effect to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, actor, retryKey]);

  // Initialize SRD spells once after actor becomes available
  useEffect(() => {
    if (!actor) return;
    const dnd = actor as unknown as DndBackend;
    void (async () => {
      try {
        await createActorProxy(dnd).initializeSrdSpells();
      } catch {
        /* SRD spell init is non-critical; silently skip */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  // ── Loading screen (isInitializing) ──────────────────────────────────────
  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--ds-bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 18 }}
          >
            Loading DungeonScribe...
          </p>
        </div>
      </div>
    );
  }

  // ── Login page (not authenticated) ───────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // ── Timeout / Could-not-connect screen ───────────────────────────────────
  if (timedOut) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--ds-bg)",
          gap: 16,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56 }}>⚔️</div>
        <h1
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 22, margin: 0 }}
        >
          Could Not Connect
        </h1>
        <p style={{ color: "var(--ds-muted)", fontSize: 15, maxWidth: 420 }}>
          DungeonScribe couldn't connect to the server. This is usually
          temporary — check your connection and try again.
        </p>
        <p
          style={{
            color: "var(--ds-muted)",
            fontSize: 13,
            maxWidth: 420,
            marginTop: -4,
          }}
        >
          The server may be temporarily unavailable. You can try reconnecting,
          or reload the page if the issue persists.
        </p>

        {/* Status diagnostics */}
        <div
          style={{
            background: "var(--ds-surface)",
            border: "1px solid var(--ds-border)",
            borderRadius: 8,
            padding: "16px 20px",
            maxWidth: 460,
            width: "100%",
            textAlign: "left",
          }}
        >
          <p
            className="font-cinzel"
            style={{
              color: "var(--ds-gold)",
              fontSize: 13,
              marginBottom: 10,
              marginTop: 0,
            }}
          >
            Connection Status
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <StatusLine
              label="Internet Identity"
              ok={isLoggedIn}
              detail="Authenticated"
            />
            <StatusLine
              label="Initialization"
              ok={!isInitializing}
              detail={isInitializing ? "Still running…" : "Completed"}
            />
            <StatusLine
              label="Backend Actor"
              ok={!!actor}
              detail={actor ? "Connected" : "Not responding"}
            />
          </div>
        </div>

        {/* Technical details (collapsible) */}
        {lastError && (
          <details
            style={{
              maxWidth: 460,
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <summary
              style={{
                color: "var(--ds-muted)",
                fontSize: 12,
                userSelect: "none",
              }}
            >
              Technical Details
            </summary>
            <pre
              style={{
                color: "var(--ds-muted)",
                fontSize: 11,
                background: "var(--ds-surface)",
                border: "1px solid var(--ds-border)",
                borderRadius: 6,
                padding: "8px 12px",
                marginTop: 6,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {lastError}
            </pre>
          </details>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontFamily: "Cinzel, serif", minWidth: 180 }}
            onClick={() => {
              // Reset timeout state and re-arm the 30s timer so the frontend
              // retries connecting to the backend without a full page reload.
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
            data-ocid="app.restart_connection_button"
          >
            ↺ Restart Connection
          </button>
          <button
            type="button"
            className="ds-btn-secondary"
            style={{ fontFamily: "Cinzel, serif", minWidth: 140 }}
            onClick={() => window.location.reload()}
            data-ocid="app.reload_page_button"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // ── Connecting screen (logged in, actor not yet ready) ───────────────────
  if (!actor) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--ds-bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <p
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 16 }}
          >
            Connecting to DungeonScribe...
          </p>
          <p style={{ color: "var(--ds-muted)", fontSize: 13, marginTop: 8 }}>
            Establishing connection to the realm
          </p>
        </div>
      </div>
    );
  }

  const dndActor = createActorProxy(actor as unknown as DndBackend);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ds-bg)" }}>
      <NavBar
        page={page}
        setPage={setPage}
        onOpenSearch={() => setSearchOpen(true)}
      />
      {searchOpen && (
        <GlobalSearch
          actor={dndActor}
          setPage={setPage}
          onClose={() => setSearchOpen(false)}
        />
      )}
      <div style={{ paddingTop: 64 }}>
        {page.name === "list" && (
          <CharacterListPage
            actor={dndActor}
            onSelectCharacter={(id) =>
              setPage({ name: "sheet", characterId: id })
            }
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "sheet" && (
          <CharacterSheetPage
            actor={dndActor}
            characterId={page.characterId}
            onBack={() => setPage({ name: "list" })}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "settings" && (
          <SettingsPage
            actor={dndActor}
            onBack={() => setPage({ name: "list" })}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "armies" && (
          <ArmyListPage
            actor={dndActor}
            onSelectArmy={(armyId) => setPage({ name: "army", armyId })}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "army" && (
          <ArmyDetailPage
            actor={dndActor}
            armyId={page.armyId}
            onBack={() => setPage({ name: "armies" })}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "world" && (
          <WorldPage
            actor={dndActor}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "campaign" && (
          <CampaignPage
            actor={dndActor}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "party" && (
          <PartyPage
            actor={dndActor}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
        {page.name === "rank_reference" && (
          <RankReferencePage
            actor={dndActor}
            onRestartConnection={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = null;
              timerStartedRef.current = false;
              setTimedOut(false);
              setLastError(null);
              setRetryKey((k) => k + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AppInner />
      </DarkModeProvider>
    </ErrorBoundary>
  );
}
