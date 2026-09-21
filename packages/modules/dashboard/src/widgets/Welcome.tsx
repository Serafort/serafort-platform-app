import React from "react";
import { Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@cap/platform-store";
import { useDashboardStats } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/**
 * Greets the signed-in user by name and states which organization and role the
 * dashboard is tailored to. Data comes from `/api/dashboard/stats`.
 */
const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const firstName = useAuthStore().user?.firstName;
  const { data, isLoading, isError, refetch } = useDashboardStats();

  const organization = data?.organizationName ?? "";
  const isPlatformOwner = data?.isPlatformOwner ?? false;
  const roleName = data?.roleName ?? "";
  const role = isPlatformOwner
    ? t("widgets.welcome.platformOwner", "Platform owner")
    : roleName;
  // Decide the variant from the untranslated role name, not the display string.
  const isAdmin = /^admin$/i.test(roleName);

  return (
    <Paper
      component="section"
      aria-labelledby="welcome-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%" }}
    >
      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton width="40%" height={36} />
          <Skeleton width="60%" />
        </Stack>
      ) : isError ? (
        <WidgetError
          message={t(
            "widgets.welcome.error",
            "Could not load your dashboard summary.",
          )}
          onRetry={() => void refetch()}
        />
      ) : (
        <Stack spacing={0.5}>
          <Typography id="welcome-title" variant="h5" component="h2">
            {firstName
              ? t("widgets.welcome.greeting", "Hello, {{name}}", {
                  name: firstName,
                })
              : t("widgets.welcome.greetingNoName", "Hello")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPlatformOwner
              ? role
              : t("widgets.welcome.context", "{{role}} · {{organization}}", {
                  role,
                  organization,
                })}
          </Typography>
          <Typography variant="body1" sx={{ pt: 1 }}>
            {isPlatformOwner
              ? t(
                  "widgets.welcome.platformHint",
                  "Here is how your platform and your customers are doing.",
                )
              : isAdmin
                ? t(
                    "widgets.welcome.adminHint",
                    "Here is how {{organization}} is doing today.",
                    { organization },
                  )
                : t(
                    "widgets.welcome.memberHint",
                    "Here is your account security and recent sign-ins.",
                  )}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

export default Welcome;
