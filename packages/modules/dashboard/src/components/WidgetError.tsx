import React from "react";
import { Alert, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

interface WidgetErrorProps {
  message: string;
  onRetry: () => void;
}

/** Inline, actionable error for a dashboard widget (4th UI state). */
export const WidgetError: React.FC<WidgetErrorProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation();
  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onRetry}
          sx={{ minHeight: 44 }}
        >
          {t("widgets.common.retry", "Retry")}
        </Button>
      }
    >
      {message}
    </Alert>
  );
};
