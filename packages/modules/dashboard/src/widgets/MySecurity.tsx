import React from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppPaths } from "@cap/shared-types";
import { useDashboardStats } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/** The signed-in user's own protection status. Data: `/api/dashboard/stats`. */
const MySecurity: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useDashboardStats();

  const lastLogin = data?.lastLogin
    ? new Date(data.lastLogin).toLocaleString(i18n.language)
    : t("widgets.mySecurity.never", "Never");

  return (
    <Paper
      component="section"
      aria-labelledby="my-security-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%", minHeight: 260 }}
    >
      <Typography id="my-security-title" variant="h6" component="h2">
        {t("widgets.mySecurity.title", "My security")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("widgets.mySecurity.subtitle", "Your account protection")}
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton height={28} />
          <Skeleton height={28} />
          <Skeleton height={28} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.mySecurity.error",
            "Could not load your security status.",
          )}
          onRetry={() => void refetch()}
        />
      ) : (
        <Stack spacing={1.5}>
          <Row label={t("widgets.mySecurity.mfa", "Two-step verification")}>
            <Chip
              size="small"
              variant="outlined"
              color={data.mfaEnabled ? "success" : "warning"}
              label={
                data.mfaEnabled
                  ? t("widgets.mySecurity.mfaOn", "Enabled")
                  : t("widgets.mySecurity.mfaOff", "Not set up")
              }
            />
          </Row>
          <Row label={t("widgets.mySecurity.sessions", "Active sessions")}>
            <Typography fontWeight={600}>{data.activeSessions}</Typography>
          </Row>
          <Row label={t("widgets.mySecurity.passkeys", "Passkeys")}>
            <Typography fontWeight={600}>{data.passkeyCount}</Typography>
          </Row>
          <Row label={t("widgets.mySecurity.lastLogin", "Last sign-in")}>
            <Typography variant="body2">{lastLogin}</Typography>
          </Row>
          {!data.mfaEnabled && (
            <Button
              component={RouterLink}
              to={AppPaths.mfa.mfa.management}
              variant="contained"
              size="small"
              sx={{ alignSelf: "flex-start", minHeight: 44 }}
            >
              {t("widgets.mySecurity.enable", "Set up two-step verification")}
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    {children}
  </Box>
);

export default MySecurity;
