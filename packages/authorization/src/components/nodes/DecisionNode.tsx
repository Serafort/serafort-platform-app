import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography, Chip, Paper, alpha, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import SecurityIcon from "@mui/icons-material/Security";
import type { DecisionNode } from "../../types/graphTypes";

export const DecisionNodeComponent = memo(
  ({ data, selected }: NodeProps<DecisionNode>) => {
    const theme = useTheme();
    const isAllow = data.effect === "allow";
    const effectColor = isAllow
      ? theme.palette.success.main
      : theme.palette.error.main;

    return (
      <Paper
        elevation={selected ? 8 : 3}
        sx={{
          minWidth: 230,
          maxWidth: 280,
          p: 2,
          borderRadius: 3,
          border: "2px solid",
          borderColor: effectColor,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(12px)",
          boxShadow: `0 0 ${selected ? 24 : 14}px ${alpha(effectColor, selected ? 0.5 : 0.25)}`,
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="decision-in"
          style={{
            width: 12,
            height: 12,
            backgroundColor: effectColor,
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 2,
              bgcolor: alpha(effectColor, 0.15),
              color: effectColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAllow ? (
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            ) : (
              <BlockIcon sx={{ fontSize: 20 }} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                color: effectColor,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {data.effect === "allow" ? "ALLOW" : "DENY"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: 10 }}
            >
              Priority: {data.priority ?? 0}
            </Typography>
          </Box>
        </Box>

        {data.reason && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: 11,
              mb: 1,
              lineHeight: 1.3,
              fontStyle: "italic",
            }}
          >
            &ldquo;{data.reason}&rdquo;
          </Typography>
        )}

        {data.stepUpMfaRequired && (
          <Chip
            icon={<SecurityIcon sx={{ fontSize: "12px !important" }} />}
            label="Requires Step-Up MFA"
            size="small"
            color="warning"
            sx={{ fontSize: 10, height: 20, fontWeight: 800, width: "100%" }}
          />
        )}
      </Paper>
    );
  },
);

DecisionNodeComponent.displayName = "DecisionNode";
