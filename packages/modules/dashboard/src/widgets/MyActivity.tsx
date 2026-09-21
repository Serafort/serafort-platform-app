import React from "react";
import {
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
import { useDashboardStats } from "../hooks/useDashboardData";
import { WidgetError } from "../components/WidgetError";

/** `PASSKEY_REGISTERED` -> `passkey registered`, for actions with no translation. */
const humanize = (action: string) => action.replace(/_/g, " ").toLowerCase();

const ACTION_COLOR: Record<string, "success" | "error"> = {
  LOGIN_SUCCESS: "success",
  FAILED_LOGIN: "error",
};

/** The user's latest sign-in attempts. Data: `/api/dashboard/stats`. */
const MyActivity: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useDashboardStats();

  return (
    <Paper
      component="section"
      aria-labelledby="my-activity-title"
      aria-busy={isLoading}
      variant="outlined"
      sx={{ p: 3, height: "100%", minHeight: 260 }}
    >
      <Typography id="my-activity-title" variant="h6" component="h2">
        {t("widgets.myActivity.title", "My recent sign-ins")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t(
          "widgets.myActivity.subtitle",
          "Latest sign-in attempts on your account",
        )}
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={32} />
        </Stack>
      ) : isError || !data ? (
        <WidgetError
          message={t(
            "widgets.myActivity.error",
            "Could not load your activity.",
          )}
          onRetry={() => void refetch()}
        />
      ) : data.recentActivity.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("widgets.myActivity.empty", "No sign-in activity yet.")}
        </Typography>
      ) : (
        <List disablePadding>
          {data.recentActivity.map((item, index) => (
            <ListItem
              key={`${item.date}-${index}`}
              disableGutters
              secondaryAction={
                <Chip
                  size="small"
                  variant="outlined"
                  color={ACTION_COLOR[item.action] ?? "default"}
                  label={t(
                    `widgets.myActivity.${item.action}`,
                    humanize(item.action),
                  )}
                />
              }
            >
              <ListItemText
                primary={new Date(item.date).toLocaleString(i18n.language)}
                secondary={item.ip ?? undefined}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MyActivity;
