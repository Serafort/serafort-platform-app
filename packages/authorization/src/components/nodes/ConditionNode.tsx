import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography, Chip, Paper, alpha, useTheme } from "@mui/material";
import RuleIcon from "@mui/icons-material/Rule";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import type { ConditionNode } from "../../types/graphTypes";

export const ConditionNodeComponent = memo(
  ({ data, selected }: NodeProps<ConditionNode>) => {
    const theme = useTheme();
    const conditionId = data.conditionId || "custom";
    const operator = data.operator || "AND";

    return (
      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          minWidth: 210,
          maxWidth: 260,
          p: 2,
          borderRadius: 3,
          border: "1.5px solid",
          borderColor: selected
            ? "warning.main"
            : alpha(theme.palette.warning.main, 0.3),
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(12px)",
          boxShadow: selected
            ? `0 0 20px ${alpha(theme.palette.warning.main, 0.4)}`
            : `0 4px 12px ${alpha("#000", 0.1)}`,
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="condition-in"
          style={{
            width: 10,
            height: 10,
            backgroundColor: theme.palette.warning.main,
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.15),
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RuleIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: 10,
              }}
            >
              ABAC Predicate
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
              noWrap
            >
              {data.label || conditionId}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Chip
            icon={<AltRouteIcon sx={{ fontSize: "12px !important" }} />}
            label={conditionId}
            size="small"
            color="warning"
            variant="outlined"
            sx={{
              fontSize: 11,
              height: 22,
              fontWeight: 700,
              borderRadius: 1.5,
            }}
          />
          <Chip
            label={operator}
            size="small"
            sx={{
              fontSize: 10,
              height: 20,
              fontWeight: 800,
              bgcolor: "action.selected",
            }}
          />
        </Box>

        <Handle
          type="source"
          position={Position.Right}
          id="condition-out"
          style={{
            width: 10,
            height: 10,
            backgroundColor: theme.palette.warning.main,
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />
      </Paper>
    );
  },
);

ConditionNodeComponent.displayName = "ConditionNode";
