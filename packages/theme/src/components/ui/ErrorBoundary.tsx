import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Alert, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

declare global {
  interface Window {
    /**
     * Error-monitoring bridge installed by the host app (see
     * `app/src/lib/sentry.ts`). Undefined when monitoring is not configured.
     */
    __SENTRY_CAPTURE__?: (
      error: unknown,
      context?: Record<string, unknown>,
    ) => void;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

/**
 * Generates a short human-readable error reference ID for support tickets.
 */
function generateErrorId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorId: generateErrorId() };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log to console in development — never in production builds
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // Forward to error monitoring. React error boundaries swallow render errors,
    // so the app installs this bridge (see app/src/lib/sentry.ts) to make sure
    // they still reach Sentry. No-op when monitoring is not configured.
    if (typeof window !== "undefined") {
      window.__SENTRY_CAPTURE__?.(error, {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // In production, never expose raw error.message — it may contain internal paths or query strings
      const userMessage = import.meta.env.DEV
        ? (this.state.error?.message ?? "An unexpected error occurred")
        : "An unexpected error occurred. Our team has been notified.";

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            p: 3,
            textAlign: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500, width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {userMessage}
            </Typography>
            {this.state.errorId && (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: "block", mb: 1 }}
              >
                Reference:{" "}
                <Chip
                  label={this.state.errorId}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }}
                />
              </Typography>
            )}
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="small"
            >
              Try Again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
