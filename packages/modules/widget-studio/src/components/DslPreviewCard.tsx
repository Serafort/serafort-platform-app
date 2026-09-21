import React, { Suspense } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import type { WidgetAuditEntry, WidgetDefinition } from "@cap/shared-types";
import { isAttestedTrail } from "../agents/auditTrail";
import { useWidgetData } from "../hooks/useWidgetData";
import { globalWidgetRegistry } from "@cap/platform-core";
import {
  RADIUS,
  codeBlock,
  hairline,
  panelCard,
  sectionLabel,
} from "../theme/studioStyles";

interface DslPreviewCardProps {
  dsl: WidgetDefinition;
  lifecycle: string;
  auditTrail?: WidgetAuditEntry[];
}

const MetaRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
}> = ({ label, value, last }) => (
  <Box
    sx={(theme) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 3,
      px: 3.5,
      py: 2.5,
      borderBottom: last ? "none" : `1px solid ${hairline(theme)}`,
    })}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: "0.8125rem" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: "0.8125rem",
        fontWeight: 500,
        textAlign: "right",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value}
    </Typography>
  </Box>
);

/**
 * The generated widget: what it is, what it looks like, and the DSL behind it.
 *
 * The preview frame used to sit inside an accent border plus a 3px glow ring,
 * which framed the widget more strongly than the widget itself was drawn. It
 * is a plain hairline frame now, so what you are judging is the widget.
 */
const DslPreviewCard: React.FC<DslPreviewCardProps> = ({
  dsl,
  lifecycle,
  auditTrail = [],
}) => {
  const descriptor = globalWidgetRegistry.get(dsl.component);
  const WidgetComponent = descriptor?.Component;

  // A binding that is never read is decoration. The preview resolves it and
  // hands the result to the widget, so what you are looking at is the widget
  // with its data rather than the widget with its placeholder props.
  const widgetData = useWidgetData(dsl);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {/* Status header */}
      <Stack direction="row" spacing={2} alignItems="center">
        <CheckCircleRounded sx={{ fontSize: 18, color: "success.main" }} />
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, flex: 1 }}>
          Widget generated
        </Typography>
        <Box
          sx={(theme) => ({
            px: 2,
            height: 20,
            display: "flex",
            alignItems: "center",
            borderRadius: RADIUS.tag,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontSize: "0.65625rem",
            fontWeight: 600,
          })}
        >
          {lifecycle}
        </Box>
      </Stack>

      {/* Widget metadata */}
      <Box sx={(theme) => ({ ...panelCard(theme), overflow: "hidden" })}>
        <MetaRow label="Name" value={dsl.name} />
        <MetaRow
          label="Component"
          value={
            <Box
              component="span"
              sx={{
                fontFamily:
                  "var(--font-mono, 'JetBrains Mono', Consolas, monospace)",
                fontSize: "0.75rem",
              }}
            >
              {dsl.component}
            </Box>
          }
        />
        <MetaRow
          label="Layout"
          value={`${dsl.layout.width} columns · ${dsl.layout.height}px tall`}
        />
        {dsl.dataSource && (
          <MetaRow
            label="Data source"
            value={
              widgetData.problem
                ? `${dsl.dataSource.provider} — not usable`
                : widgetData.isLoading
                  ? `${dsl.dataSource.provider} — loading`
                  : widgetData.isError
                    ? `${dsl.dataSource.provider} — unavailable`
                    : widgetData.data
                      ? `${dsl.dataSource.provider} — ${widgetData.data.origin}`
                      : dsl.dataSource.provider
            }
          />
        )}
        <MetaRow label="Version" value={dsl.version} last />
      </Box>

      {/* Live widget preview */}
      <Box>
        <Typography sx={{ ...sectionLabel, mb: 2, color: "text.secondary" }}>
          Preview
        </Typography>
        <Box
          sx={(theme) => ({
            ...panelCard(theme),
            backgroundColor: theme.palette.background.default,
            overflow: "hidden",
            minHeight: 140,
          })}
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
              <WidgetComponent
                {...(dsl.props ?? {})}
                {...(widgetData.data ? { data: widgetData.data.data } : {})}
              />
            </Suspense>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 140,
                gap: 2,
                px: 4,
              }}
            >
              <CodeRounded sx={{ fontSize: 24, color: "text.disabled" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8125rem", textAlign: "center" }}
              >
                No component named &quot;{dsl.component}&quot; is registered, so
                there is nothing to preview.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* A binding the platform cannot honour is worth saying out loud: the
          widget will render, just without the data it asked for. */}
      {(widgetData.problem || widgetData.isError) && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", mt: -1.5 }}
        >
          {widgetData.problem ??
            "This widget's data source could not be reached; it is rendering without data."}
        </Typography>
      )}

      {/* Audit trail */}
      {auditTrail.length > 0 && (
        <Box>
          <Typography sx={{ ...sectionLabel, mb: 2, color: "text.secondary" }}>
            History
          </Typography>
          <Box sx={(theme) => ({ ...panelCard(theme), overflow: "hidden" })}>
            {auditTrail.map((entry, index) => (
              <MetaRow
                key={`${entry.generatedAt}-${index}`}
                label={`${entry.action} · ${entry.createdBy}`}
                value={
                  <Box component="span" sx={{ fontSize: "0.75rem" }}>
                    {new Date(entry.generatedAt).toLocaleString()}
                  </Box>
                }
                last={index === auditTrail.length - 1}
              />
            ))}
          </Box>
          {/*
            An entry this browser wrote is a local note, not evidence: the
            same code that records it also decides what it says. Saying so is
            the difference between a log and a claim.
          */}
          {!isAttestedTrail(auditTrail) && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", mt: 1.5 }}
            >
              Recorded on this device — not a server-attested trail.
            </Typography>
          )}
        </Box>
      )}

      {/* DSL JSON viewer */}
      <Box>
        <Typography sx={{ ...sectionLabel, mb: 2, color: "text.secondary" }}>
          Widget DSL
        </Typography>
        <Box
          component="pre"
          sx={(theme) => ({ ...codeBlock(theme), maxHeight: 160 })}
        >
          {JSON.stringify(dsl, null, 2)}
        </Box>
      </Box>
    </Box>
  );
};

export default DslPreviewCard;
