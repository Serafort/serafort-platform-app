import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import History from "@mui/icons-material/History";
import type { TenantThemeConfig } from "@cap/theme";
import {
  aiThemePromptService,
  CURATED_PROMPT_SUGGESTIONS,
  type PromptSuggestion,
  type PromptAnalysisResult,
  getWcagComplianceBadge,
} from "../services/aiThemePromptService";

/*
 * A NOTE ON SPACING NUMBERS IN THIS FILE
 *
 * composeMuiTheme overrides theme.spacing to `var(--spacing-N, calc(0.25rem *
 * N))`, and no numeric `--spacing-N` variables are emitted (only the named
 * xs/sm/md/lg/xl ones), so every sx spacing value here resolves against a
 * **4px** unit - half of MUI's usual 8px. `p: 4` is 16px, not 32px; `gap: 7`
 * is 28px. The values below are therefore roughly double what the same design
 * would use in a stock MUI app; they are chosen to land on the spacing the
 * design system actually asks for (4-8px between tightly coupled controls,
 * 24-32px between independent sections).
 *
 * Border-radius numbers are unaffected - those multiply theme.shape
 * .borderRadius (the tenant's own `md` radius token, 8px by default), so
 * `borderRadius: 1.5` is 12px and follows the tenant to 0 under a brutalist
 * preset.
 */

export interface AiThemeStudioPanelProps {
  currentTheme: TenantThemeConfig;
  onThemeGenerated: (theme: TenantThemeConfig) => void;
}

/**
 * Small-caps section heading. Structure is carried by typography and
 * whitespace rather than by yet another nested card, so each section has one
 * obvious focal point instead of four competing borders.
 */
const SectionLabel: React.FC<{
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ children, action }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      mb: 3,
    }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: 600,
        letterSpacing: "0.08em",
        lineHeight: 1,
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
    {action}
  </Box>
);

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

export const AiThemeStudioPanel: React.FC<AiThemeStudioPanelProps> = ({
  currentTheme,
  onThemeGenerated,
}) => {
  const theme = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<PromptAnalysisResult | null>(
    null,
  );
  const [synthesisSource, setSynthesisSource] = useState<
    "llm" | "heuristic" | null
  >(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Modern Dark",
    "Clean SaaS",
    "Vibrant & Creative",
    "Warm & Earthy",
    "Luxury & Boutique",
  ];

  const filteredSuggestions =
    selectedCategory === "All"
      ? CURATED_PROMPT_SUGGESTIONS
      : CURATED_PROMPT_SUGGESTIONS.filter(
          (s) => s.category === selectedCategory,
        );

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = (customPrompt || prompt).trim();
    if (!textToRun) return;

    setIsGenerating(true);
    try {
      const analysis = aiThemePromptService.analyzePrompt(textToRun);
      setLastAnalysis(analysis);

      // Always try to hit the backend generation API first
      const generatedConfig =
        await aiThemePromptService.generateThemeFromPromptAsync(
          textToRun,
          currentTheme,
        );

      const source =
        (generatedConfig.metadata as any)?.synthesisSource === "llm"
          ? "llm"
          : "heuristic";
      setSynthesisSource(source);
      onThemeGenerated(generatedConfig);

      setPromptHistory((prev) =>
        [textToRun, ...prev.filter((p) => p !== textToRun)].slice(0, 5),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.prompt);
    handleGenerate(suggestion.prompt);
  };

  // Surface recipe shared by the composer, the result panel and the cards, so
  // every boundary in here reads as the same kind of object.
  const surface = {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1.5,
    bgcolor: "background.paper",
  } as const;

  const canGenerate = Boolean(prompt.trim()) && !isGenerating;

  const contrastBadge = lastAnalysis
    ? getWcagComplianceBadge(lastAnalysis.textHex, lastAnalysis.backgroundHex)
    : null;

  const swatches = lastAnalysis
    ? ([
        { label: "Primary", hex: lastAnalysis.primaryHex },
        { label: "Secondary", hex: lastAnalysis.secondaryHex },
        { label: "Background", hex: lastAnalysis.backgroundHex },
        { label: "Surface", hex: lastAnalysis.surfaceHex },
      ] as const)
    : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {/*
        Composer. The prompt *is* this tab, so it opens the panel directly
        rather than sitting under a tinted banner restating what the
        placeholder already demonstrates. One focal point, no preamble.
      */}
      <Box
        sx={{
          ...surface,
          overflow: "hidden",
          transition: theme.transitions.create(["border-color", "box-shadow"], {
            duration: 150,
          }),
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            // ⌘/Ctrl + Enter submits, the convention every other prompt box
            // the user has met already follows. Plain Enter stays a newline so
            // multi-clause descriptions are still writable.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canGenerate) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="Describe a look — e.g. calm fintech console, deep navy primary, soft neutral surfaces, gently rounded cards"
          aria-label="Theme description prompt"
          slotProps={{
            input: {
              sx: {
                p: 4,
                alignItems: "flex-start",
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                // The bordered shell above owns the outline; the field inside
                // it must not draw a second one.
                "& fieldset": { border: "none" },
              },
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            flexWrap: "wrap",
            paddingInline: 4,
            paddingBlock: 3,
            borderBlockStart: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
          }}
        >
          {/* The placeholder already demonstrates what to write, so this slot
              teaches the shortcut instead of repeating the advice. Matches the
              app's existing ⌘K search affordance. */}
          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.disabled",
              minWidth: 0,
              ...ellipsis,
            }}
          >
            <Box
              component="kbd"
              sx={{
                paddingInline: 1.5,
                paddingBlock: 0.5,
                borderRadius: 0.5,
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: "inherit",
                fontSize: "0.6875rem",
                lineHeight: 1.6,
              }}
            >
              ⌘ ↵
            </Box>
            to generate
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleGenerate()}
            disabled={!canGenerate}
            startIcon={
              isGenerating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AutoAwesome sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              // Stays pinned to the end even if the row wraps on a narrow
              // drawer, rather than drifting to the start under the hint.
              marginInlineStart: "auto",
              minHeight: 44,
              paddingInline: 5,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {isGenerating ? "Synthesizing…" : "Generate theme"}
          </Button>
        </Box>
      </Box>

      {/* Result of the last synthesis */}
      {lastAnalysis && (
        <Box sx={{ ...surface, overflow: "hidden" }}>
          {/* The generated palette is its own headline - no green "success"
              wash needed to say the same thing in a duller way. */}
          <Box
            sx={{
              blockSize: 4,
              background: `linear-gradient(90deg, ${lastAnalysis.primaryHex}, ${lastAnalysis.secondaryHex})`,
            }}
          />
          <Box sx={{ p: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  inlineSize: 22,
                  blockSize: 22,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.success.main, 0.14),
                  color: "success.main",
                  flexShrink: 0,
                }}
              >
                <Check sx={{ fontSize: 14 }} />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, flex: 1, minWidth: 0, ...ellipsis }}
              >
                Applied · {lastAnalysis.detectedMood}
              </Typography>
            </Box>

            <Stack
              direction="row"
              useFlexGap
              spacing={1.5}
              sx={{ flexWrap: "wrap", mb: 3 }}
            >
              <Chip
                size="small"
                variant="outlined"
                label={
                  synthesisSource === "heuristic"
                    ? `Local synthesis · ${lastAnalysis.presetMatch}`
                    : `AI synthesis · ${lastAnalysis.presetMatch}`
                }
                sx={{ fontWeight: 500, textTransform: "capitalize" }}
              />
              {contrastBadge && (
                <Chip
                  size="small"
                  variant="outlined"
                  color={contrastBadge.color}
                  label={`Body text ${contrastBadge.label}`}
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              {lastAnalysis.explanation}
            </Typography>

            {/* 180px min keeps these four on an even 2x2 in the drawer
                rather than 3 + a lone orphan; on the full-page layout there
                is room for all four across. */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 3,
              }}
            >
              {swatches.map((swatch) => (
                <Box
                  key={swatch.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      inlineSize: 28,
                      blockSize: 28,
                      borderRadius: 0.75,
                      bgcolor: swatch.hex,
                      border: `1px solid ${theme.palette.divider}`,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", fontWeight: 600, ...ellipsis }}
                    >
                      {swatch.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontFamily: "monospace",
                        ...ellipsis,
                      }}
                    >
                      {swatch.hex}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Curated starting points */}
      <Box>
        <SectionLabel
          action={
            <Typography variant="caption" color="text.secondary">
              {filteredSuggestions.length}{" "}
              {filteredSuggestions.length === 1 ? "style" : "styles"}
            </Typography>
          }
        >
          Style inspiration
        </SectionLabel>

        <Stack
          direction="row"
          useFlexGap
          spacing={1.5}
          sx={{ flexWrap: "wrap", mb: 4 }}
        >
          {categories.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <Chip
                key={cat}
                label={cat}
                clickable
                aria-pressed={selected}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  blockSize: 34,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: `1px solid ${selected ? "transparent" : theme.palette.divider}`,
                  bgcolor: selected ? "primary.main" : "transparent",
                  color: selected ? "primary.contrastText" : "text.secondary",
                  "&:hover": {
                    bgcolor: selected
                      ? "primary.dark"
                      : alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              />
            );
          })}
        </Stack>

        {filteredSuggestions.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No styles in this category yet — describe your own above.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 3,
            }}
          >
            {filteredSuggestions.map((suggestion) => (
              <Box
                key={suggestion.id}
                component="button"
                type="button"
                disabled={isGenerating}
                onClick={() => handleSelectSuggestion(suggestion)}
                sx={{
                  ...surface,
                  display: "block",
                  inlineSize: "100%",
                  p: 0,
                  font: "inherit",
                  color: "inherit",
                  textAlign: "start",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: theme.transitions.create(
                    ["border-color", "transform", "box-shadow"],
                    { duration: 150 },
                  ),
                  "&:hover:not(:disabled)": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  },
                  "&:hover:not(:disabled) .suggestion-go": {
                    opacity: 1,
                    transform: "none",
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                  "&:disabled": { cursor: "default", opacity: 0.6 },
                }}
              >
                {/*
                  A miniature of the theme itself - the palette's own
                  background carrying primary/secondary bars - reads far faster
                  than three loose dots, and gives every card a distinct
                  silhouette to remember it by.
                */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    blockSize: 56,
                    paddingInline: 3,
                    bgcolor: suggestion.previewColors.background,
                    borderBlockEnd: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      inlineSize: 38,
                      blockSize: 8,
                      borderRadius: 4,
                      bgcolor: suggestion.previewColors.primary,
                    }}
                  />
                  <Box
                    sx={{
                      inlineSize: 20,
                      blockSize: 8,
                      borderRadius: 4,
                      bgcolor: suggestion.previewColors.secondary,
                    }}
                  />
                </Box>

                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        minWidth: 0,
                        ...ellipsis,
                      }}
                    >
                      {suggestion.title}
                    </Typography>
                    <ArrowForward
                      className="suggestion-go"
                      sx={{
                        fontSize: 16,
                        color: "primary.main",
                        opacity: 0,
                        transform: "translateX(-4px)",
                        transition: theme.transitions.create(
                          ["opacity", "transform"],
                          { duration: 150 },
                        ),
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ...clamp2, mt: 1, lineHeight: 1.5 }}
                  >
                    {suggestion.prompt}
                  </Typography>
                  {/* Tags as one quiet line: they label the card, they aren't
                      four more things to click. */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 2,
                      color: "text.disabled",
                      ...ellipsis,
                    }}
                  >
                    {suggestion.tags.join(" · ")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Recent prompts */}
      {promptHistory.length > 0 && (
        <Box>
          <SectionLabel>Recent prompts</SectionLabel>
          <Stack spacing={1}>
            {promptHistory.map((histPrompt) => (
              <Box
                key={histPrompt}
                component="button"
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setPrompt(histPrompt);
                  handleGenerate(histPrompt);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  inlineSize: "100%",
                  minHeight: 44,
                  paddingInline: 3,
                  paddingBlock: 2,
                  border: "none",
                  borderRadius: 1,
                  bgcolor: "transparent",
                  font: "inherit",
                  color: "inherit",
                  textAlign: "start",
                  cursor: "pointer",
                  transition: theme.transitions.create("background-color", {
                    duration: 150,
                  }),
                  "&:hover:not(:disabled)": { bgcolor: "action.hover" },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                  "&:disabled": { cursor: "default", opacity: 0.6 },
                }}
              >
                <History sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography
                  variant="body2"
                  sx={{ flex: 1, minWidth: 0, ...ellipsis }}
                >
                  {histPrompt}
                </Typography>
                <ArrowForward
                  sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default AiThemeStudioPanel;
