import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export interface DynamicAiWidgetDataPoint {
  label: string;
  value: string | number;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
}

export interface DynamicAiWidgetSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: "metric-cards" | "bar-chart" | "progress-gauges" | "status-feed";
  accentColor?: string;
  items: DynamicAiWidgetDataPoint[];
  prompt?: string;
}

export const DynamicAiWidget: React.FC<{ spec: DynamicAiWidgetSpec }> = ({
  spec,
}) => {
  const { title, subtitle, type, items, prompt } = spec;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2.5,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        border: (theme) => `1px solid ${theme.palette.primary.main}44`,
        boxShadow: (theme) => `0 0 12px ${theme.palette.primary.main}15`,
      }}
    >
      {/* AI Ribbon Badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "0.675rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 13 }} />
        GenAI Dynamic Widget
      </Box>

      <CardContent
        sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Metric Cards Variant */}
        {type === "metric-cards" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            {items.map((item, idx) => (
              <Card
                key={idx}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {item.label}
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.25 }}>
                  {item.value}
                </Typography>
                {item.trend && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    mt={0.5}
                  >
                    {item.trend === "up" ? (
                      <TrendingUpIcon fontSize="small" color="success" />
                    ) : (
                      <TrendingDownIcon fontSize="small" color="error" />
                    )}
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={
                        item.trend === "up" ? "success.main" : "error.main"
                      }
                    >
                      {item.trendValue ||
                        (item.trend === "up" ? "+12%" : "-4%")}
                    </Typography>
                  </Stack>
                )}
              </Card>
            ))}
          </Box>
        )}

        {/* Progress Gauges Variant */}
        {type === "progress-gauges" && (
          <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: "center" }}>
            {items.map((item, idx) => (
              <Box key={idx}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {item.value}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage || 65}
                  color={item.color || "primary"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Stack>
        )}

        {/* Bar Chart Mock Variant */}
        {type === "bar-chart" && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "flex-end",
              gap: 1.5,
              pt: 1,
              pb: 0.5,
            }}
          >
            {items.map((item, idx) => {
              const heightPct = item.percentage || (idx + 1) * 20;
              return (
                <Box
                  key={idx}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ fontSize: "0.675rem" }}
                  >
                    {item.value}
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: `${heightPct}%`,
                      maxHeight: "100%",
                      bgcolor: item.color
                        ? `${item.color}.main`
                        : "primary.main",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.4s ease-in-out",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.675rem" }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Prompt Citation */}
        {prompt && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              mt: 1.5,
              display: "block",
              fontSize: "0.65rem",
              fontStyle: "italic",
            }}
          >
            Generated from: "{prompt}"
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicAiWidget;
