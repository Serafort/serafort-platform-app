import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AutoFixHighRounded from "@mui/icons-material/AutoFixHighRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import PublishRounded from "@mui/icons-material/PublishRounded";
import StopRounded from "@mui/icons-material/StopRounded";
import { useWidgetStudio, useAppStore } from "@cap/platform-store";
import { stopPipelineRun } from "../agents/pipeline";
import {
  useGenerateWidget,
  usePublishWidget,
  useWidgetAuditTrail,
} from "../hooks/useWidgetStudioQuery";
import PromptInput from "../components/PromptInput";
import AgentPipelineTracker from "../components/AgentPipelineTracker";
import DslPreviewCard from "../components/DslPreviewCard";
import PublishConfirmDialog from "../components/PublishConfirmDialog";
import { sanitizePrompt } from "../agents/sanitizer";
import { migrateWidgetDsl } from "../agents/dslSchema";
import {
  applyStructuralRefinement,
  buildRefinementRequest,
  detectStructuralIntent,
} from "../agents/refineDraft";
import RefineInput from "../components/RefineInput";
import {
  CONTROL_HEIGHT,
  RADIUS,
  accentStrip,
  hairline,
  iconTile,
  panelCardInteractive,
  panelCardSelected,
  primaryAction,
  sectionLabel,
} from "../theme/studioStyles";

const DRAWER_WIDTH = 400;

/**
 * WidgetStudioPanel — The main AI Widget Studio UI.
 * Renders as a right-side Drawer on the dashboard.
 *
 * Tabs:
 *   • Generate — prompt input + live pipeline tracker
 *   • History  — list of past drafts
 *
 * Styling comes from ../theme/studioStyles, which is the panel's whole visual
 * vocabulary: hairline cards, one accent, 44px controls, 8/12px radii. The
 * gradient header, gradient publish button and glow rings this replaced were
 * hard-wired to primary+secondary, so they ignored the tenant theme and every
 * style preset the theme editor can apply.
 */
export const WidgetStudioPanel: React.FC = () => {
  const {
    widgetStudioPanelOpen,
    closeWidgetStudioPanel,
    widgetDrafts,
    activeDraftId,
    widgetStudioRunning,
    createWidgetDraft,
    setActiveDraft,
    deleteWidgetDraft,
    getActiveDraft,
  } = useWidgetStudio();

  const activeRunId = useAppStore((state) => state.activeRunId);

  const [tab, setTab] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [refineNotice, setRefineNotice] = useState<string | null>(null);

  const generateMutation = useGenerateWidget();
  const publishMutation = usePublishWidget();
  const setWidgetDsl = useAppStore((state) => state.setWidgetDsl);
  const widgetDraftsRef = useRef(widgetDrafts);
  widgetDraftsRef.current = widgetDrafts;

  const activeDraft = getActiveDraft();

  // The server's trail when this draft came from a run, the local one
  // otherwise. Server entries replace rather than join the local ones: a
  // record that is attested end to end is worth more than a longer one that
  // is half hearsay.
  const serverAudit = useWidgetAuditTrail(activeDraft?.runId);
  const auditTrail = serverAudit.entries.length
    ? serverAudit.entries
    : (activeDraft?.auditTrail ?? []);

  /**
   * Bring stored definitions up to the current schema, once, when the panel
   * opens. Drafts are persisted, so a definition written by an older build is
   * read back by this one; migrating on open (and writing the result back)
   * means the rest of the panel only ever sees the current shape.
   */
  useEffect(() => {
    if (!widgetStudioPanelOpen) return;
    for (const draft of widgetDraftsRef.current) {
      if (!draft.dsl) continue;
      const { dsl, migrated } = migrateWidgetDsl(draft.dsl);
      if (migrated) setWidgetDsl(draft.id, dsl);
    }
  }, [widgetStudioPanelOpen, setWidgetDsl]);

  // ─── Generate Handler ───────────────────────────────────────────────────

  const handleSubmitPrompt = useCallback(
    (rawPrompt: string) => {
      const sanitized = sanitizePrompt(rawPrompt)
        .sanitized.slice(0, 1000)
        .trim();
      if (!sanitized) return;

      const draftId = createWidgetDraft(sanitized);
      setTab(0);

      generateMutation.mutate({
        draftId,
        prompt: sanitized,
      });
    },
    [createWidgetDraft, generateMutation],
  );

  // ─── Stop Handler ──────────────────────────────────────────────────────

  /**
   * A run lives on the server, so there has to be a way out of one that is
   * taking too long or has gone quiet. Without this the panel could sit on
   * "Running" indefinitely and the only exit was reloading the page.
   */
  const handleStop = useCallback(async () => {
    if (!activeRunId) return;
    setIsStopping(true);
    try {
      await stopPipelineRun(activeRunId, activeDraftId ?? undefined);
    } finally {
      setIsStopping(false);
    }
  }, [activeRunId, activeDraftId]);

  // ─── Refine Handler ────────────────────────────────────────────────────

  /**
   * Refining produces a new draft rather than editing this one, so the
   * version you had a moment ago stays in History. A size change is applied
   * here and now; anything else is a new run seeded with this definition.
   */
  const handleRefine = useCallback(
    (instruction: string) => {
      if (!activeDraft?.dsl || !activeDraftId) return;
      const nextRevision = (activeDraft.revision ?? 1) + 1;

      const intent = detectStructuralIntent(instruction);
      if (intent) {
        const { dsl, changed, error } = applyStructuralRefinement(
          activeDraft.dsl,
          intent,
        );
        if (!changed) {
          setRefineNotice("That is already as far as the grid goes.");
          return;
        }
        if (!dsl) {
          setRefineNotice(error || "That change did not validate.");
          return;
        }
        setRefineNotice(null);
        createWidgetDraft(activeDraft.prompt, {
          parentDraftId: activeDraftId,
          revision: nextRevision,
          refinement: instruction,
          dsl,
          lifecycle: "approved",
        });
        return;
      }

      setRefineNotice(null);
      const request = buildRefinementRequest({
        originalPrompt: activeDraft.prompt,
        instruction,
        dsl: activeDraft.dsl,
        parentDraftId: activeDraftId,
      });
      const draftId = createWidgetDraft(request.prompt, {
        parentDraftId: activeDraftId,
        revision: nextRevision,
        refinement: instruction,
      });
      generateMutation.mutate({
        draftId,
        prompt: request.prompt,
        baseDsl: request.baseDsl,
        parentDraftId: request.parentDraftId,
        refinement: request.refinement,
      });
    },
    [activeDraft, activeDraftId, createWidgetDraft, generateMutation],
  );

  // ─── Publish Handler ───────────────────────────────────────────────────

  const handlePublish = useCallback(() => {
    if (!activeDraftId || !activeDraft?.dsl) return;
    setPublishDialogOpen(false);

    publishMutation.mutate({
      draftId: activeDraftId,
      dsl: activeDraft.dsl,
      pageId: "dashboard",
    });
  }, [activeDraftId, activeDraft, publishMutation]);

  const canPublish =
    activeDraft &&
    activeDraft.dsl &&
    ["approved", "previewed", "validated"].includes(activeDraft.lifecycle) &&
    !widgetStudioRunning &&
    !publishMutation.isPending;

  // ─── Error State ────────────────────────────────────────────────────────

  const hasGenerationError = generateMutation.isError;
  const hasPublishError = publishMutation.isError;

  return (
    <>
      <Drawer
        anchor="right"
        open={widgetStudioPanelOpen}
        onClose={closeWidgetStudioPanel}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            maxWidth: "100vw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
        id="widget-studio-drawer"
      >
        {/* ---- Header ---- */}
        <Box
          sx={(theme) => ({
            px: 5,
            pt: 5,
            pb: 4,
            borderBottom: `1px solid ${hairline(theme)}`,
          })}
        >
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Box sx={(theme) => iconTile(theme, 40)}>
              <AutoFixHighRounded
                sx={{ fontSize: 20, color: "primary.main" }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}
              >
                Widget Studio
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8125rem" }}
              >
                Describe a widget; the agents build and check it.
              </Typography>
            </Box>
            <IconButton
              id="widget-studio-close-btn"
              onClick={closeWidgetStudioPanel}
              aria-label="Close Widget Studio"
              sx={{
                width: CONTROL_HEIGHT,
                height: CONTROL_HEIGHT,
                mt: -2.5,
                mr: -2.5,
                borderRadius: RADIUS.control,
                color: "text.secondary",
              }}
            >
              <CloseRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* ---- Tabs ----
            Underline tabs rather than the old full-width pair: the count sits
            inline instead of in a Badge, which used to clip against the tab
            label at this width. */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={(theme) => ({
            px: 3,
            borderBottom: `1px solid ${hairline(theme)}`,
            minHeight: CONTROL_HEIGHT,
            "& .MuiTab-root": {
              minHeight: CONTROL_HEIGHT,
              px: 3,
              gap: 1.75,
              fontSize: "0.84375rem",
              fontWeight: 500,
              textTransform: "none",
              color: "text.secondary",
              "&.Mui-selected": { fontWeight: 600 },
            },
          })}
        >
          <Tab
            id="widget-studio-tab-generate"
            label="Generate"
            icon={<AutoFixHighRounded sx={{ fontSize: 17 }} />}
            iconPosition="start"
          />
          <Tab
            id="widget-studio-tab-history"
            iconPosition="start"
            icon={<HistoryRounded sx={{ fontSize: 17 }} />}
            label={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <span>History</span>
                {widgetDrafts.length > 0 && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {widgetDrafts.length}
                  </Typography>
                )}
              </Stack>
            }
          />
        </Tabs>

        {/* ---- Tab Content ---- */}
        <Box sx={{ flex: 1, overflow: "hidden auto", p: 5 }}>
          {/* ---- Generate Tab ---- */}
          {tab === 0 && (
            <Stack spacing={4.5}>
              {/* Generation error banner */}
              {hasGenerationError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: RADIUS.control }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => generateMutation.reset()}
                      sx={{ textTransform: "none" }}
                    >
                      Dismiss
                    </Button>
                  }
                >
                  {generateMutation.error?.message ||
                    "Generation failed. Please try again."}
                </Alert>
              )}

              {/* Publish error banner */}
              {hasPublishError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: RADIUS.control }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => publishMutation.reset()}
                      sx={{ textTransform: "none" }}
                    >
                      Dismiss
                    </Button>
                  }
                >
                  {publishMutation.error?.message ||
                    "Publish failed. Please try again."}
                </Alert>
              )}

              {/* Prompt input, in the panel's one tinted strip */}
              <Box sx={(theme) => ({ ...accentStrip(theme), p: 3.5 })}>
                <Typography
                  sx={{ ...sectionLabel, mb: 2.5, color: "text.secondary" }}
                >
                  Describe your widget
                </Typography>
                <PromptInput
                  onSubmit={handleSubmitPrompt}
                  disabled={false}
                  isRunning={widgetStudioRunning || generateMutation.isPending}
                />
              </Box>

              {/* Agent Pipeline Tracker */}
              {activeDraft && (
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2.5 }}
                  >
                    <Typography
                      sx={{ ...sectionLabel, color: "text.secondary", flex: 1 }}
                    >
                      Agent pipeline
                    </Typography>
                    {widgetStudioRunning && activeRunId !== null && (
                      <Button
                        id="widget-studio-stop-btn"
                        size="small"
                        color="inherit"
                        startIcon={<StopRounded />}
                        onClick={handleStop}
                        disabled={isStopping}
                        sx={{
                          ...primaryAction,
                          minHeight: 32,
                          px: 2.5,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                        }}
                      >
                        {isStopping ? "Stopping…" : "Stop"}
                      </Button>
                    )}
                  </Stack>
                  <AgentPipelineTracker agents={activeDraft.agents} />
                </Box>
              )}

              {/* DSL Preview + Publish */}
              {activeDraft?.dsl && (
                <>
                  <DslPreviewCard
                    dsl={activeDraft.dsl}
                    lifecycle={activeDraft.lifecycle}
                    auditTrail={auditTrail}
                  />

                  <RefineInput
                    onRefine={handleRefine}
                    disabled={widgetStudioRunning}
                    notice={refineNotice}
                  />

                  {canPublish && (
                    <Button
                      id="widget-studio-publish-btn"
                      variant="contained"
                      fullWidth
                      startIcon={<PublishRounded />}
                      onClick={() => setPublishDialogOpen(true)}
                      sx={primaryAction}
                    >
                      Publish to dashboard
                    </Button>
                  )}

                  {activeDraft.lifecycle === "published" && (
                    <Alert
                      severity="success"
                      sx={{ borderRadius: RADIUS.control }}
                    >
                      Widget published to your dashboard.
                    </Alert>
                  )}
                </>
              )}
            </Stack>
          )}

          {/* ---- History Tab ---- */}
          {tab === 1 && (
            <Stack spacing={2.5}>
              {widgetDrafts.length === 0 ? (
                <Box
                  sx={(theme) => ({
                    px: 4,
                    py: 8,
                    textAlign: "center",
                    borderRadius: RADIUS.card,
                    border: `1px dashed ${theme.palette.divider}`,
                  })}
                >
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    No widgets yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.8125rem", mt: 1 }}
                  >
                    Anything you generate is kept here, so you can come back to
                    a draft and publish it later.
                  </Typography>
                </Box>
              ) : (
                [...widgetDrafts].reverse().map((draft) => {
                  const isActive = activeDraftId === draft.id;
                  const statusColor =
                    draft.lifecycle === "published"
                      ? "success.main"
                      : draft.lifecycle === "draft"
                        ? "warning.main"
                        : "primary.main";

                  return (
                    <Box
                      key={draft.id}
                      id={`widget-studio-draft-${draft.id}`}
                      onClick={() => {
                        setActiveDraft(draft.id);
                        setTab(0);
                      }}
                      sx={(theme) => ({
                        ...panelCardInteractive(theme),
                        ...(isActive ? panelCardSelected(theme) : null),
                        p: 3.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                      })}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {draft.prompt}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1.75}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: statusColor,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {draft.lifecycle}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem", opacity: 0.85 }}
                          >
                            · {new Date(draft.createdAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWidgetDraft(draft.id);
                        }}
                        aria-label={`Delete draft: ${draft.prompt}`}
                        sx={{
                          width: CONTROL_HEIGHT,
                          height: CONTROL_HEIGHT,
                          flexShrink: 0,
                          borderRadius: RADIUS.control,
                          color: "text.secondary",
                        }}
                      >
                        <DeleteOutlineRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  );
                })
              )}
            </Stack>
          )}
        </Box>
      </Drawer>

      {/* Publish confirmation dialog */}
      <PublishConfirmDialog
        open={publishDialogOpen}
        dsl={activeDraft?.dsl ?? null}
        onConfirm={handlePublish}
        onCancel={() => setPublishDialogOpen(false)}
        isPublishing={publishMutation.isPending}
      />
    </>
  );
};

export default WidgetStudioPanel;
