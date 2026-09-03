import React, { Suspense } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import type { WidgetDefinition } from "@cap/shared-types";
import { globalWidgetRegistry } from "@cap/platform-core";

interface DslPreviewCardProps {
  dsl: WidgetDefinition;
  lifecycle: string;
}

const DslPreviewCard: React.FC<DslPreviewCardProps> = ({ dsl, lifecycle }) => {
  const descriptor = globalWidgetRegistry.get(dsl.component);
  const WidgetComponent = descriptor?.Component;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Status header */}
      <Stack direction="row" spacing={1} alignItems="center">
        <CheckCircleRounded color="success" sx={{ fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Widget Generated
        </Typography>
        <Chip
          label={lifecycle}
          size="small"
          color={
            lifecycle === "published"
              ? "success"
              : lifecycle === "approved"
                ? "primary"
                : "default"
          }
          sx={{ fontSize: "0.68rem", fontWeight: 700 }}
        />
      </Stack>

      {/* Widget metadata */}
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {dsl.name}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Component
            </Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              fontFamily="monospace"
              sx={{ fontSize: "0.65rem" }}
            >
              {dsl.component}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Layout
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {dsl.layout.width}-col · {dsl.layout.height}px
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Version
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {dsl.version}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Divider>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <CodeRounded sx={{ fontSize: 14 }} /> Live Preview
        </Typography>
      </Divider>

      {/* Live widget preview */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "primary.main",
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}22`,
          minHeight: 140,
        }}
      >
        {WidgetComponent ? (
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 140,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            }
          >
            <WidgetComponent {...(dsl.props ?? {})} />
          </Suspense>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 140,
              gap: 1,
            }}
          >
            <CodeRounded color="disabled" sx={{ fontSize: 32 }} />
            <Typography variant="caption" color="text.secondary">
              Component &quot;{dsl.component}&quot; not found in registry
            </Typography>
          </Box>
        )}
      </Box>

      {/* DSL JSON viewer */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ mb: 0.5, display: "block" }}
        >
          Widget DSL
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            fontSize: "0.65rem",
            fontFamily: "monospace",
            color: "text.secondary",
            overflow: "auto",
            maxHeight: 160,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {JSON.stringify(dsl, null, 2)}
        </Box>
      </Box>
    </Box>
  );
};

export default DslPreviewCard;
