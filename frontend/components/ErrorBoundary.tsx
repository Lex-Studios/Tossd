import React, { Component, ErrorInfo, ReactNode, useEffect, useRef } from "react";
import styles from "./ErrorBoundary.module.css";

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown error");
}

export type ErrorBoundaryFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback, or a render prop receiving error + reset. */
  fallback?:
    | ReactNode
    | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /** Called after `console.error` — e.g. send to your logging backend. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called after a successful reset (Try again). */
  onReset?: () => void;
  /** When any entry changes vs the previous render, the boundary resets. */
  resetKeys?: ReadonlyArray<unknown>;
  /** Show `error.message` in the default fallback (off in production if you prefer). */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function resetKeysChanged(
  prev: ReadonlyArray<unknown> | undefined,
  next: ReadonlyArray<unknown> | undefined
): boolean {
  if (!prev?.length || !next?.length || prev.length !== next.length) return false;
  return next.some((key, i) => key !== prev[i]);
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { hasError: true, error: normalizeError(error) };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { hasError } = this.state;
    if (!hasError) return;
    if (resetKeysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    if (hasError && error) {
      const fallbackProps: ErrorBoundaryFallbackProps = {
        error,
        resetErrorBoundary: this.reset,
      };
      const { fallback, showDetails } = this.props;
      if (typeof fallback === "function") {
        return fallback(fallbackProps);
      }
      if (fallback != null) {
        return fallback;
      }
      return (
        <DefaultErrorFallback {...fallbackProps} showDetails={showDetails ?? false} />
      );
    }
    return this.props.children;
  }
}

type DefaultErrorFallbackProps = ErrorBoundaryFallbackProps & {
  showDetails: boolean;
};

export function DefaultErrorFallback({
  error,
  resetErrorBoundary,
  showDetails,
}: DefaultErrorFallbackProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section
      className={styles.root}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      {...(showDetails ? { "aria-describedby": "error-boundary-message" } : {})}
    >
      <h2 ref={titleRef} tabIndex={-1} className={styles.title}>
        Something went wrong
      </h2>
      <p className={styles.lead}>
        This section could not be displayed. You can try again or reload the page.
      </p>
      {showDetails ? (
        <pre className={styles.details} id="error-boundary-message">
          {error.message}
        </pre>
      ) : null}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={resetErrorBoundary}
        >
          Try again
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    </section>
  );
}
