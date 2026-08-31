import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import WbSunny from "@mui/icons-material/WbSunny";
import Cloud from "@mui/icons-material/Cloud";
import Umbrella from "@mui/icons-material/Umbrella";
import Air from "@mui/icons-material/Air";
import { useTranslation } from "react-i18next";

const currentConditions = [
  { key: "wind", value: "14 km/h", icon: Air },
  { key: "humidity", value: "58%", icon: Cloud },
  { key: "rain", value: "10%", icon: Umbrella },
];

/**
 * Dummy widget used to exercise the widget registry and lazy-loading.
 * Renders a simple current-conditions weather card.
 */
const Weather: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
      }}
    >
      <Box>
        <Typography variant="h6">{t("widgets.weather.title")}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("widgets.weather.subtitle")}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mt: 1,
        }}
      >
        <WbSunny color="warning" sx={{ fontSize: 56 }} />
        <Typography variant="h3" sx={{ fontWeight: 600 }}>
          24°C
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sunny · Casablanca
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
          {currentConditions.map(({ key, value, icon: Icon }) => (
            <Stack key={key} alignItems="center" spacing={0.5}>
              <Icon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default Weather;
