import React from "react";
import {
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePlatformOverview } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/**
 * The platform's largest tenants by member count, with the plan, location and
 * privacy regime of each. Data: `/api/dashboard/platform-overview`.
 */
const TopTenants: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlatformOverview();

  return (
    <Paper
      component="section"
      aria-labelledby="top-tenants-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%", minHeight: 320 }}
    >
      <Typography id="top-tenants-title" variant="h6" component="h2">
        {t("widgets.topTenants.title", "Largest tenants")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("widgets.topTenants.subtitle", "Ranked by members")}
      </Typography>

      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton height={36} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t("widgets.topTenants.error", "Could not load tenants.")}
          onRetry={() => void refetch()}
        />
      ) : data.topTenants.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("widgets.topTenants.empty", "No tenants yet.")}
        </Typography>
      ) : (
        <TableContainer
          tabIndex={0}
          aria-label={t(
            "widgets.topTenants.caption",
            "Largest tenants by members",
          )}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("widgets.topTenants.name", "Tenant")}</TableCell>
                <TableCell>{t("widgets.topTenants.plan", "Plan")}</TableCell>
                <TableCell>
                  {t("widgets.topTenants.location", "Location")}
                </TableCell>
                <TableCell>
                  {t("widgets.topTenants.regulation", "Privacy law")}
                </TableCell>
                <TableCell sx={{ textAlign: "end" }}>
                  {t("widgets.topTenants.members", "Members")}
                </TableCell>
                <TableCell>
                  {t("widgets.topTenants.status", "Status")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topTenants.map((tenant) => {
                const { countryCode, usState, regulation } =
                  tenant.jurisdiction;
                const location = countryCode
                  ? usState
                    ? t(
                        "widgets.topTenants.locationWithState",
                        "{{country}} · {{state}}",
                        { country: countryCode, state: usState },
                      )
                    : countryCode
                  : t("widgets.topTenants.unknownLocation", "Not set");
                return (
                  <TableRow key={tenant.id} hover>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>
                      {t(`widgets.common.plan.${tenant.plan}`, tenant.plan)}
                    </TableCell>
                    <TableCell>{location}</TableCell>
                    <TableCell>
                      {regulation ??
                        t("widgets.topTenants.none", "None on file")}
                    </TableCell>
                    <TableCell sx={{ textAlign: "end" }}>
                      {tenant.members}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t(
                          `widgets.common.status.${tenant.status}`,
                          tenant.status,
                        )}
                        color={
                          tenant.status === "ACTIVE" ? "success" : "default"
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TopTenants;
