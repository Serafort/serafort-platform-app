import React from "react";
import { Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePlatformOverview } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/**
 * New tenants and new user accounts per month over the last six months, the
 * trend a platform owner watches to judge growth.
 * Data: `/api/dashboard/platform-overview`.
 */
const TenantGrowth: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = usePlatformOverview();
  const isRtl = theme.direction === "rtl";

  const monthLabel = (month: string) => {
    const [year, m] = month.split("-").map(Number);
    return new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, m - 1, 1)));
  };

  const rows = (data?.growth ?? []).map((m) => ({
    ...m,
    label: monthLabel(m.month),
  }));
  const hasGrowth = rows.some((m) => m.newTenants + m.newUsers > 0);
  const tenantsName = t("widgets.tenantGrowth.newTenants", "New tenants");
  const usersName = t("widgets.tenantGrowth.newUsers", "New users");

  return (
    <Paper
      component="section"
      aria-labelledby="tenant-growth-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{
        position: "relative",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
      }}
    >
      <Typography id="tenant-growth-title" variant="h6" component="h2">
        {t("widgets.tenantGrowth.title", "Customer growth")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          "widgets.tenantGrowth.subtitle",
          "New tenants and new user accounts per month",
        )}
      </Typography>

      {isLoading ? (
        <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 220 }} />
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.tenantGrowth.error",
            "Could not load growth data.",
          )}
          onRetry={() => void refetch()}
        />
      ) : !hasGrowth ? (
        <Typography variant="body2" color="text.secondary">
          {t("widgets.tenantGrowth.empty", "No growth data yet.")}
        </Typography>
      ) : (
        <>
          <div style={{ flex: 1, minHeight: 220 }} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="label"
                  reversed={isRtl}
                  stroke={theme.palette.text.secondary}
                  tick={{ fontFamily: theme.typography.fontFamily }}
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  orientation={isRtl ? "right" : "left"}
                  stroke={theme.palette.text.secondary}
                  tick={{ fontFamily: theme.typography.fontFamily }}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: theme.typography.fontFamily,
                  }}
                  labelStyle={{ color: theme.palette.text.primary }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: theme.typography.fontFamily }}
                />
                <Bar
                  dataKey="newTenants"
                  name={tenantsName}
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="newUsers"
                  name={usersName}
                  fill={theme.palette.success.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Text alternative for the chart, read by screen readers instead. */}
          <table
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }}
          >
            <caption>
              {t("widgets.tenantGrowth.title", "Customer growth")}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("widgets.tenantGrowth.month", "Month")}</th>
                <th scope="col">{tenantsName}</th>
                <th scope="col">{usersName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.month}>
                  <th scope="row">{m.label}</th>
                  <td>{m.newTenants}</td>
                  <td>{m.newUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Paper>
  );
};

export default TenantGrowth;
