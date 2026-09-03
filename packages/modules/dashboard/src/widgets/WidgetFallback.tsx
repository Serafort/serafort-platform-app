import React from "react";
import { Box, Skeleton } from "@mui/material";

export const WidgetFallback: React.FC<{
  title: string;
  minHeight?: number;
}> = ({ title, minHeight = 240 }) => (
  <Box
    sx={{
      p: 2,
      minHeight,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 2,
      border: "1px dashed",
      borderColor: "error.main",
      bgcolor: "error.lighterOpacity",
    }}
  >
    <Box sx={{ color: "text.secondary", typography: "body2" }}>
      Failed to load {title}. Try refreshing the widget.
    </Box>
  </Box>
);

export const WidgetSkeleton: React.FC<{ minHeight?: number }> = ({
  minHeight = 240,
}) => (
  <Skeleton
    variant="rounded"
    width="100%"
    height={minHeight}
    animation="wave"
  />
);

export default WidgetFallback;
