import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';
import { logEvent, getSessionId } from '@/lib/productionLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  correlationId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, correlationId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, correlationId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const entry = logEvent(
      'error',
      'react.ErrorBoundary',
      error.message,
      `${error.stack || ''}\n--- componentStack ---${errorInfo.componentStack || ''}`,
    );
    this.setState({ correlationId: entry.id });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, correlationId: null });
  };

  handleCopy = async () => {
    const { correlationId, error } = this.state;
    const payload = `id=${correlationId}\nsession=${getSessionId()}\nurl=${location.href}\nmessage=${error?.message}\nstack=${error?.stack || ''}`;
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // ignore
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { correlationId, error } = this.state;

      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-lg font-display font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">
              An unexpected error occurred. Please try again.
            </p>
            {correlationId && (
              <div className="mb-6 p-3 rounded-lg border border-border bg-muted/30 text-left">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Correlation ID
                </div>
                <code className="font-mono text-xs break-all text-foreground">{correlationId}</code>
                {error?.message && (
                  <div className="mt-2 text-xs text-destructive break-words">{error.message}</div>
                )}
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {correlationId && (
                <button
                  onClick={this.handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy details
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
