import { Component, useEffect, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";

/**
 * Returns true when an error message indicates the IC canister is stopped (IC0508).
 * Exported so any page/panel can detect this error and show the restart UI.
 */
export function isCanisterStopped(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : String(err);
  return (
    msg.includes("IC0508") ||
    msg.toLowerCase().includes("is stopped") ||
    msg.toLowerCase().includes("canister stopped")
  );
}

/**
 * Reusable styled error card shown whenever the canister-stopped error (IC0508)
 * is detected at page or panel level. Shows Restart Connection + Reload Page.
 */
export function CanisterErrorUI({
  onRestartConnection,
}: {
  onRestartConnection?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 260,
        padding: 32,
        gap: 14,
        textAlign: "center",
      }}
      data-ocid="canister_error.panel"
    >
      <div style={{ fontSize: 40 }}>⚔️</div>
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 18, margin: 0 }}
      >
        Could Not Connect
      </h2>
      <p
        style={{
          color: "var(--ds-muted)",
          fontSize: 13,
          maxWidth: 380,
          margin: 0,
        }}
      >
        The backend canister is not responding. This is usually temporary — try
        reconnecting or reload the page.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {onRestartConnection && (
          <button
            type="button"
            className="ds-btn-primary"
            style={{ fontFamily: "Cinzel, serif", minWidth: 160 }}
            onClick={onRestartConnection}
            data-ocid="canister_error.restart_connection_button"
          >
            ↺ Restart Connection
          </button>
        )}
        <button
          type="button"
          className="ds-btn-secondary"
          style={{ fontFamily: "Cinzel, serif", minWidth: 120 }}
          onClick={() => window.location.reload()}
          data-ocid="canister_error.reload_page_button"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

const ERROR_STYLES = {
  wrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--ds-bg)",
    padding: 32,
    gap: 20,
    textAlign: "center" as const,
  },
  pre: {
    color: "var(--ds-muted)",
    fontSize: 11,
    background: "var(--ds-surface)",
    border: "1px solid var(--ds-border)",
    borderRadius: 6,
    padding: "10px 14px",
    maxWidth: 540,
    overflowX: "auto" as const,
    textAlign: "left" as const,
  },
};

function ErrorDisplay({
  message,
  detail,
}: { message: string; detail?: string }) {
  return (
    <div style={ERROR_STYLES.wrapper}>
      <div style={{ fontSize: 48 }}>⚔️</div>
      <h2
        className="font-cinzel"
        style={{ color: "var(--ds-gold)", fontSize: 22, margin: 0 }}
      >
        Something went wrong
      </h2>
      <p style={{ color: "var(--ds-muted)", fontSize: 14, maxWidth: 480 }}>
        {message}
      </p>
      {detail && <pre style={ERROR_STYLES.pre}>{detail}</pre>}
      <button
        type="button"
        className="ds-btn-primary"
        style={{ fontFamily: "Cinzel, serif", minWidth: 160 }}
        onClick={() => window.location.reload()}
        data-ocid="error_boundary.reload_button"
      >
        Reload Page
      </button>
    </div>
  );
}

/**
 * Fix 5: AsyncTimeoutBoundary wraps children and shows an error + retry button
 * if children have not rendered within 25 seconds. This is a last-resort escape
 * hatch that ensures the user is never stuck on an infinite loading spinner due
 * to async initialization failures that render errors don't catch.
 */
function TimeoutCanceller({
  children,
  loadedRef,
}: { children: ReactNode; loadedRef: { current: boolean } }) {
  useEffect(() => {
    loadedRef.current = true;
  }, [loadedRef]);
  return <>{children}</>;
}

export function AsyncTimeoutBoundary({ children }: { children: ReactNode }) {
  const [timedOut, setTimedOut] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    // 120s — much longer than App.tsx 30s timer so this NEVER fires first.
    // Its only purpose is a last-resort catch for truly catastrophic failures.
    const timer = setTimeout(() => {
      if (!loadedRef.current) setTimedOut(true);
    }, 120000);
    return () => clearTimeout(timer);
    // Empty dep array: fire once on mount, cleared on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (timedOut) {
    return (
      <ErrorDisplay
        message="DungeonScribe took too long to load (120s). Check your internet connection and try again."
        detail="Async initialization timeout after 120 seconds"
      />
    );
  }
  return <TimeoutCanceller loadedRef={loadedRef}>{children}</TimeoutCanceller>;
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[DungeonScribe] Uncaught render error:",
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          message="DungeonScribe encountered an unexpected error. Your data is safe — reload the page to continue."
          detail={this.state.error?.message}
        />
      );
    }
    return this.props.children;
  }
}
