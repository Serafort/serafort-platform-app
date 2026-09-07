import React from "react";
import { Box, Typography, Stack, LinearProgress, Collapse } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ErrorRounded from "@mui/icons-material/ErrorRounded";
import ProgressActivityRounded from "@mui/icons-material/RotateRightRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import type { AgentState, AgentId } from "@cap/shared-types";
import { RADIUS, codeBlock, hairline, panelCard } from "../theme/studioStyles";

interface AgentPipelineTrackerProps {
  agents: AgentState[];
}

const AGENT_LABELS: Record<AgentId, { label: string; description: string }> = {
  requirement: {
    label: "Requirement",
    description: "Extracting features from your prompt",
  },
  design: {
    label: "Design",
    description: "Planning layout and UX specification",
  },
  component: {
    label: "Component",
    description: "Selecting registered widget components",
  },
  validation: {
    label: "Validation",
    description: "Running security and schema checks",
  },
  preview: {
    label: "Preview",
    description: "Generating component preview",
  },
  publish: {
    label: "Publish",
    description: "Publishing widget to dashboard",
  },
};

const StatusIcon: React.FC<{ status: AgentState["status"] }> = ({ status }) => {
  switch (status) {
    case "done":
      return (
        <CheckCircleRounded sx={{ fontSize: 18, color: "success.main" }} />
      );
    case "error":
      return <ErrorRounded sx={{ fontSize: 18, color: "error.main" }} />;
    case "running":
      return (
        <ProgressActivityRounded
          sx={{
            fontSize: 18,
            color: "primary.main",
            animation: "widget-studio-spin 1s linear infinite",
            "@keyframes widget-studio-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      );
    default:
      return (
        <RadioButtonUncheckedRounded
          sx={{ fontSize: 18, color: "text.disabled" }}
        />
      );
  }
};

/**
 * The six-agent run, as a list of steps.
 *
 * Only the step that is actually running is tinted. Every finished step used
 * to carry a green wash and a status chip repeating what its own icon already
 * said, so a completed pipeline was six loud rows with nothing to look at -
 * and no way to see at a glance which step the run was on.
 */
const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  agents,
}) => {
  const totalDone = agents.filter((a) => a.status === "done").length;
  const progress = agents.length ? (totalDone / agents.length) * 100 : 0;
  const hasError = agents.some((a) => a.status === "error");
  const status = hasError
    ? "Stopped"
    : totalDone === agents.length
      ? "Finished"
      : "Running";

  return (
    <Box>
      {/* Overall progress bar */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            {status}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.75rem", fontWeight: 600 }}
          >
            {totalDone}/{agents.length}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={hasError ? "error" : "primary"}
          sx={(theme) => ({
            height: 4,
            borderRadius: RADIUS.pill,
            backgroundColor: hairline(theme),
            "& .MuiLinearProgress-bar": { borderRadius: RADIUS.pill },
          })}
        />
      </Box>

      {/* Agent step cards */}
      <Stack spacing={1.5}>
        {agents.map((agent) => {
          const meta = AGENT_LABELS[agent.id];
          const isActive = agent.status === "running";
          const isError = agent.status === "error";

          return (
            <Box
              key={agent.id}
              id={`widget-studio-agent-${agent.id}`}
              sx={(theme) => ({
                ...panelCard(theme),
                p: 3,
                transition: theme.transitions.create(
                  ["border-color", "background-color", "opacity"],
                  { duration: 200 },
                ),
                ...(agent.status === "idle" && { opacity: 0.55 }),
                ...(isActive && {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                }),
                ...(isError && {
                  borderColor: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.06),
                }),
              })}
            >
              <Stack direction="row" spacing={2.5} alignItems="flex-start">
                <Box sx={{ pt: 0.25, display: "flex" }}>
                  <StatusIcon status={agent.status} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    {meta.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isError ? "error.main" : "text.secondary"}
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {isError ? agent.error : meta.description}
                  </Typography>

                  {/* Streaming text — typewriter effect */}
                  <Collapse
                    in={Boolean(agent.streamedText && agent.status !== "idle")}
                  >
                    <Box
                      sx={(theme) => ({
                        ...codeBlock(theme),
                        mt: 2,
                        p: 2.5,
                        maxHeight: 80,
                        overflow: "hidden auto",
                      })}
                    >
                      {agent.streamedText}
                      {agent.status === "running" && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 6,
                            height: 12,
                            verticalAlign: "text-bottom",
                            bgcolor: "primary.main",
                            ml: 0.25,
                            animation: "widget-studio-blink 0.8s ease infinite",
                            "@keyframes widget-studio-blink": {
                              "0%, 100%": { opacity: 1 },
                              "50%": { opacity: 0 },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Collapse>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default AgentPipelineTracker;
