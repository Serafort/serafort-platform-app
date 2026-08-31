import React, { useCallback, useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Button,
  Tabs,
  Tab,
  Badge,
  Alert,
} from '@mui/material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import AutoFixHighRounded from '@mui/icons-material/AutoFixHighRounded'
import HistoryRounded from '@mui/icons-material/HistoryRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import PublishRounded from '@mui/icons-material/PublishRounded'
import { useWidgetStudio } from '@cap/platform-store'
import { useGenerateWidget, usePublishWidget } from '../hooks/useWidgetStudioQuery'
import PromptInput from '../components/PromptInput'
import AgentPipelineTracker from '../components/AgentPipelineTracker'
import DslPreviewCard from '../components/DslPreviewCard'
import PublishConfirmDialog from '../components/PublishConfirmDialog'

const DRAWER_WIDTH = 400

/**
 * WidgetStudioPanel — The main AI Widget Studio UI.
 * Renders as a right-side Drawer on the dashboard.
 *
 * Tabs:
 *   • Generate — prompt input + live pipeline tracker
 *   • History  — list of past drafts
 */
const WidgetStudioPanel: React.FC = () => {
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
  } = useWidgetStudio()

  const [tab, setTab] = useState(0)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  const generateMutation = useGenerateWidget()
  const publishMutation = usePublishWidget()

  const activeDraft = getActiveDraft()

  // ─── Generate Handler ───────────────────────────────────────────────────

  const handleSubmitPrompt = useCallback(
    (prompt: string) => {
      const draftId = createWidgetDraft(prompt)
      setTab(0)

      generateMutation.mutate({
        draftId,
        prompt,
      })
    },
    [createWidgetDraft, generateMutation],
  )

  // ─── Publish Handler ───────────────────────────────────────────────────

  const handlePublish = useCallback(() => {
    if (!activeDraftId || !activeDraft?.dsl) return
    setPublishDialogOpen(false)

    publishMutation.mutate({
      draftId: activeDraftId,
      dsl: activeDraft.dsl,
      pageId: 'dashboard',
    })
  }, [activeDraftId, activeDraft, publishMutation])

  const canPublish =
    activeDraft &&
    activeDraft.dsl &&
    ['approved', 'previewed', 'validated'].includes(activeDraft.lifecycle) &&
    !widgetStudioRunning &&
    !publishMutation.isPending

  // ─── Error State ────────────────────────────────────────────────────────

  const hasGenerationError = generateMutation.isError
  const hasPublishError = publishMutation.isError

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
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
        id="widget-studio-drawer"
      >
        {/* ---- Header ---- */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.secondary.main}12)`,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => `0 2px 8px ${theme.palette.primary.main}44`,
                }}
              >
                <AutoFixHighRounded sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                  AI Widget Studio
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                  Powered by Gemini
                </Typography>
              </Box>
            </Stack>
            <IconButton
              id="widget-studio-close-btn"
              size="small"
              onClick={closeWidgetStudioPanel}
              aria-label="Close Widget Studio"
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* ---- Tabs ---- */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1 }}
          variant="fullWidth"
        >
          <Tab
            id="widget-studio-tab-generate"
            label="Generate"
            icon={<AutoFixHighRounded sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ fontSize: '0.75rem', minHeight: 44 }}
          />
          <Tab
            id="widget-studio-tab-history"
            label={
              <Badge badgeContent={widgetDrafts.length} color="primary" max={99}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <HistoryRounded sx={{ fontSize: 16 }} />
                  <span>History</span>
                </Stack>
              </Badge>
            }
            sx={{ fontSize: '0.75rem', minHeight: 44 }}
          />
        </Tabs>

        {/* ---- Tab Content ---- */}
        <Box sx={{ flex: 1, overflow: 'hidden auto', p: 2 }}>

          {/* ---- Generate Tab ---- */}
          {tab === 0 && (
            <Stack spacing={2.5}>
              {/* Generation error banner */}
              {hasGenerationError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => generateMutation.reset()}
                    >
                      Dismiss
                    </Button>
                  }
                >
                  {generateMutation.error?.message || 'Generation failed. Please try again.'}
                </Alert>
              )}

              {/* Publish error banner */}
              {hasPublishError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => publishMutation.reset()}
                    >
                      Dismiss
                    </Button>
                  }
                >
                  {publishMutation.error?.message || 'Publish failed. Please try again.'}
                </Alert>
              )}

              {/* Prompt Input */}
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  DESCRIBE YOUR WIDGET
                </Typography>
                <PromptInput
                  onSubmit={handleSubmitPrompt}
                  disabled={false}
                  isRunning={widgetStudioRunning || generateMutation.isPending}
                />
              </Box>

              {/* Agent Pipeline Tracker */}
              {activeDraft && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      AGENT PIPELINE
                    </Typography>
                    <AgentPipelineTracker agents={activeDraft.agents} />
                  </Box>
                </>
              )}

              {/* DSL Preview + Publish */}
              {activeDraft?.dsl && (
                <>
                  <Divider />
                  <Box>
                    <DslPreviewCard dsl={activeDraft.dsl} lifecycle={activeDraft.lifecycle} />
                  </Box>

                  {canPublish && (
                    <Button
                      id="widget-studio-publish-btn"
                      variant="contained"
                      fullWidth
                      startIcon={<PublishRounded />}
                      onClick={() => setPublishDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: (theme) => `0 4px 16px ${theme.palette.primary.main}44`,
                        '&:hover': { transform: 'translateY(-1px)' },
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Publish to Dashboard
                    </Button>
                  )}

                  {activeDraft.lifecycle === 'published' && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      ✓ Widget published to your dashboard!
                    </Alert>
                  )}
                </>
              )}
            </Stack>
          )}

          {/* ---- History Tab ---- */}
          {tab === 1 && (
            <Stack spacing={1}>
              {widgetDrafts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No widgets generated yet
                  </Typography>
                </Box>
              ) : (
                [...widgetDrafts].reverse().map((draft) => (
                  <Box
                    key={draft.id}
                    id={`widget-studio-draft-${draft.id}`}
                    onClick={() => {
                      setActiveDraft(draft.id)
                      setTab(0)
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: activeDraftId === draft.id ? 'primary.main' : 'divider',
                      bgcolor: activeDraftId === draft.id ? 'primary.main' : 'transparent',
                      ...(activeDraftId === draft.id && { bgcolor: (theme) => `${theme.palette.primary.main}10` }),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: 'primary.main', bgcolor: (theme) => `${theme.palette.primary.main}08` },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {draft.prompt}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                            {new Date(draft.createdAt).toLocaleString()}
                          </Typography>
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: draft.lifecycle === 'published'
                                ? 'success.main'
                                : draft.lifecycle === 'draft'
                                ? 'warning.main'
                                : 'primary.main',
                            }}
                          />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                            {draft.lifecycle}
                          </Typography>
                        </Stack>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWidgetDraft(draft.id)
                        }}
                        aria-label="Delete draft"
                        sx={{ flexShrink: 0 }}
                      >
                        <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                ))
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
  )
}

export default WidgetStudioPanel
