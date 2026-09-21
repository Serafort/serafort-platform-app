import React from "react";
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTenantOverview } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/** `PASSKEY_REGISTERED` -> `passkey registered`, for actions with no translation. */
const humanize = (action: string) => action.replace(/_/g, " ").toLowerCase();

/**
 * Headline numbers for the caller's own organization. Organization admins only:
 * the API answers 403 for other roles, and the role layouts don't place it there.
 * Data: `/api/dashboard/tenant-overview`.
 */
const TenantOverview: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useTenantOverview();

  return (
    <Paper
      component="section"
      aria-labelledby="tenant-overview-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%", minHeight: 280 }}
    >
      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton width="50%" height={32} />
          <Skeleton height={80} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.tenantOverview.error",
            "Could not load the organization overview.",
          )}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <Typography id="tenant-overview-title" variant="h6" component="h2">
            {t("widgets.tenantOverview.title", "{{organization}} overview", {
              organization: data.organizationName,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              "widgets.tenantOverview.subtitle",
              "Your organization at a glance",
            )}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              mb: 2,
            }}
          >
            <Stat
              label={t("widgets.tenantOverview.members", "Members")}
              value={data.memberCount}
            />
            <Stat
              label={t("widgets.tenantOverview.sessions", "Active sessions")}
              value={data.activeSessions}
            />
            <Stat
              label={t(
                "widgets.tenantOverview.failed",
                "Failed sign-ins today",
              )}
              value={data.failedLoginsToday}
              warn={data.failedLoginsToday > 0}
            />
          </Box>

          <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
            {t("widgets.tenantOverview.byRole", "Members by role")}
          </Typography>
          {data.membersByRole.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("widgets.tenantOverview.noRoles", "No members yet.")}
            </Typography>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              {data.membersByRole.map((row) => (
                <Chip
                  key={row.role}
                  label={t(
                    "widgets.tenantOverview.roleCount",
                    "{{role}}: {{count}}",
                    { role: row.role, count: row.count },
                  )}
                />
              ))}
            </Stack>
          )}

          <Typography variant="subtitle2" component="h3">
            {t("widgets.tenantOverview.recent", "Latest organization events")}
          </Typography>
          {data.recentEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("widgets.tenantOverview.empty", "No events yet.")}
            </Typography>
          ) : (
            <List dense disablePadding>
              {data.recentEvents.map((event, index) => (
                <ListItem key={`${event.date}-${index}`} disableGutters>
                  <ListItemText
                    primary={t(
                      `widgets.auditActions.${event.action}`,
                      humanize(event.action),
                    )}
                    secondary={new Date(event.date).toLocaleString(
                      i18n.language,
                    )}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
    </Paper>
  );
};

const Stat: React.FC<{ label: string; value: number; warn?: boolean }> = ({
  label,
  value,
  warn,
}) => (
  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
    <Typography
      variant="h4"
      component="p"
      color={warn ? "warning.dark" : "text.primary"}
      fontWeight={700}
    >
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default TenantOverview;
