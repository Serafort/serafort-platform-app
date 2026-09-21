import React from "react";
import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePlatformOverview } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

interface KpiProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  warn?: boolean;
}

const Kpi: React.FC<KpiProps> = ({ label, value, hint, warn }) => (
  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="h4"
      component="p"
      fontWeight={700}
      color={warn ? "warning.dark" : "text.primary"}
    >
      {value}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    )}
  </Box>
);

/**
 * The platform owner's headline numbers: how many tenants (customers) there
 * are, how many people they serve, and the security signals worth watching.
 * Data: `/api/dashboard/platform-overview`.
 */
const PlatformKpis: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlatformOverview();

  return (
    <Paper
      component="section"
      aria-labelledby="platform-kpis-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%" }}
    >
      <Typography id="platform-kpis-title" variant="h6" component="h2">
        {t("widgets.platformKpis.title", "Platform at a glance")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          "widgets.platformKpis.subtitle",
          "Your customers and the people they serve",
        )}
      </Typography>

      {isLoading ? (
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={96} sx={{ flex: 1 }} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.platformKpis.error",
            "Could not load the platform overview.",
          )}
          onRetry={() => void refetch()}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          <Kpi
            label={t("widgets.platformKpis.tenants", "Tenants")}
            value={data.tenants.total}
            hint={t("widgets.platformKpis.tenantsActive", "{{count}} active", {
              count: data.tenants.active,
            })}
          />
          <Kpi
            label={t(
              "widgets.platformKpis.newTenants",
              "New tenants (30 days)",
            )}
            value={data.tenants.newLast30Days}
            hint={t(
              "widgets.platformKpis.vsPrevious",
              "{{count}} in the previous 30 days",
              { count: data.tenants.newPrevious30Days },
            )}
          />
          <Kpi
            label={t("widgets.platformKpis.members", "Members across tenants")}
            value={data.people.members}
            hint={t(
              "widgets.platformKpis.distinctMembers",
              "{{count}} distinct people",
              { count: data.people.distinctMembers },
            )}
          />
          <Kpi
            label={t("widgets.platformKpis.users", "User accounts")}
            value={data.people.users}
            hint={t("widgets.platformKpis.usersActive", "{{count}} active", {
              count: data.people.activeUsers,
            })}
          />
          <Kpi
            label={t(
              "widgets.platformKpis.mfa",
              "Two-step verification adoption",
            )}
            value={`${data.people.mfaAdoptionPercent}%`}
            hint={t(
              "widgets.platformKpis.noMfa",
              "{{count}} accounts without it",
              { count: data.people.usersWithoutMfa },
            )}
            warn={data.people.mfaAdoptionPercent < 50}
          />
          <Kpi
            label={t("widgets.platformKpis.failed", "Failed sign-ins (7 days)")}
            value={data.risk.failedLoginsLast7Days}
            hint={t(
              "widgets.platformKpis.sessionsLine",
              "Live sessions: {{count}}",
              { count: data.risk.activeSessions },
            )}
            warn={data.risk.failedLoginsLast7Days > 0}
          />
        </Box>
      )}
    </Paper>
  );
};

export default PlatformKpis;
