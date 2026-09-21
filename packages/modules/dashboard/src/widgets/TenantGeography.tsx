import React from "react";
import {
  Box,
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

const REGION_ORDER = ["US", "EU", "OTHER", "UNKNOWN"] as const;

/**
 * Where the platform's tenants are based (United States, EU/EEA, elsewhere) and
 * which privacy regime that puts them under, with a per-state breakdown for the
 * US since each state has its own rules.
 * Data: `/api/dashboard/platform-overview`. The regulation names are a
 * reference, not legal advice.
 */
const TenantGeography: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlatformOverview();

  const totalTenants = data?.tenants.total ?? 0;
  const regions = data
    ? REGION_ORDER.map((region) => ({
        region,
        row: data.geography.byRegion.find((r) => r.region === region),
      })).filter(({ row }) => row && row.tenants > 0)
    : [];

  return (
    <Paper
      component="section"
      aria-labelledby="tenant-geography-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%", minHeight: 320 }}
    >
      <Typography id="tenant-geography-title" variant="h6" component="h2">
        {t("widgets.tenantGeography.title", "Where your tenants are")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          "widgets.tenantGeography.subtitle",
          "Legal home of each tenant and the privacy regime that applies",
        )}
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={80} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.tenantGeography.error",
            "Could not load tenant locations.",
          )}
          onRetry={() => void refetch()}
        />
      ) : regions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("widgets.tenantGeography.noTenants", "No tenants yet.")}
        </Typography>
      ) : (
        <>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {regions.map(({ region, row }) => {
              if (!row) return null;
              const percent =
                totalTenants > 0
                  ? Math.round((row.tenants / totalTenants) * 100)
                  : 0;
              const label = t(
                `widgets.tenantGeography.region${region}`,
                region,
              );
              const detail = t(
                "widgets.tenantGeography.regionDetail",
                "{{tenants}} · {{members}}",
                {
                  tenants: t(
                    "widgets.tenantGeography.tenantsCount",
                    "{{count}} tenants",
                    { count: row.tenants },
                  ),
                  members: t(
                    "widgets.tenantGeography.membersCount",
                    "{{count}} members",
                    { count: row.members },
                  ),
                },
              );
              return (
                <Box key={region}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detail}
                    </Typography>
                  </Box>
                  <Box
                    role="img"
                    aria-label={`${label}: ${percent}%`}
                    sx={{
                      mt: 0.5,
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "action.hover",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${percent}%`,
                        bgcolor:
                          region === "UNKNOWN"
                            ? "text.secondary"
                            : "primary.main",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Stack>

          <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
            {t("widgets.tenantGeography.usStates", "US states")}
          </Typography>
          {data.geography.usStates.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("widgets.tenantGeography.noUsTenants", "No US tenants yet.")}
            </Typography>
          ) : (
            <TableContainer
              tabIndex={0}
              aria-label={t("widgets.tenantGeography.usStates", "US states")}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t("widgets.tenantGeography.state", "State")}
                    </TableCell>
                    <TableCell>
                      {t("widgets.tenantGeography.regulation", "Privacy law")}
                    </TableCell>
                    <TableCell sx={{ textAlign: "end" }}>
                      {t("widgets.tenantGeography.tenants", "Tenants")}
                    </TableCell>
                    <TableCell sx={{ textAlign: "end" }}>
                      {t("widgets.tenantGeography.members", "Members")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.geography.usStates.map((row) => (
                    <TableRow key={row.state}>
                      <TableCell>{row.state}</TableCell>
                      <TableCell>
                        {row.regulation ?? (
                          <Typography
                            component="span"
                            variant="body2"
                            color="warning.dark"
                          >
                            {t(
                              "widgets.tenantGeography.noComprehensiveLaw",
                              "No comprehensive state privacy law on file",
                            )}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: "end" }}>
                        {row.tenants}
                      </TableCell>
                      <TableCell sx={{ textAlign: "end" }}>
                        {row.members}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box component="ul" sx={{ m: 0, mt: 2, pl: 2.5 }}>
            {(
              [
                [
                  "coverageWith",
                  data.geography.regulation.tenantsWithLaw,
                  "{{count}} tenants under a comprehensive privacy law",
                ],
                [
                  "coverageWithout",
                  data.geography.regulation.tenantsWithoutLaw,
                  "{{count}} tenants with no comprehensive law on file",
                ],
                [
                  "coverageUnknown",
                  data.geography.regulation.tenantsUnknown,
                  "{{count}} tenants with an unknown location",
                ],
              ] as const
            ).map(([key, count, fallback]) => (
              <Typography
                key={key}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {t(`widgets.tenantGeography.${key}`, fallback, { count })}
              </Typography>
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 1 }}
          >
            {t(
              "widgets.tenantGeography.disclaimer",
              "Reference only, not legal advice. Confirm with counsel; sector rules (e.g. HIPAA) apply on top.",
            )}
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default TenantGeography;
