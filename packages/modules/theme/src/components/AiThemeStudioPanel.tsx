import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  AutoGrid,
  ChoiceChip,
  SectionLabel,
  SwatchReadout,
  clamp2,
  ellipsis,
  useFocusRingSx,
  useSurfaceSx,
} from "./studioUi";

export interface AiThemeStudioPanelProps {
  currentTheme: TenantThemeConfig;
  onThemeGenerated: (theme: TenantThemeConfig) => void;
}

export const AiThemeStudioPanel: React.FC<AiThemeStudioPanelProps> = ({
  currentTheme,
  onThemeGenerated,
}) => {
  const { t } = useTranslation();
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

  // Values double as the filter key matched against `suggestion.category`, so
  // they stay in English; `categoryLabel` renders the localized display text.
  const categories = [
    "All",
    "Modern Dark",
    "Clean SaaS",
    "Vibrant & Creative",
    "Warm & Earthy",
    "Luxury & Boutique",
  ];
  const categoryLabel = (cat: string) =>
    t(`theme.ai.category.${cat.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, cat);

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

  const surface = useSurfaceSx();
  const focusRing = useFocusRingSx();

  const canGenerate = Boolean(prompt.trim()) && !isGenerating;

  const contrastBadge = lastAnalysis
    ? getWcagComplianceBadge(lastAnalysis.textHex, lastAnalysis.backgroundHex)
    : null;

  const swatches = lastAnalysis
    ? ([
        {
          label: t("theme.colors.label.primary", "Primary"),
          hex: lastAnalysis.primaryHex,
        },
        {
          label: t("theme.colors.label.secondary", "Secondary"),
          hex: lastAnalysis.secondaryHex,
        },
        {
          label: t("theme.colors.label.background", "Background"),
          hex: lastAnalysis.backgroundHex,
        },
        {
          label: t("theme.colors.label.surface", "Surface"),
          hex: lastAnalysis.surfaceHex,
        },
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
          placeholder={t(
            "theme.ai.prompt_placeholder",
            "Describe a look — e.g. calm fintech console, deep navy primary, soft neutral surfaces, gently rounded cards",
          )}
          aria-label={t("theme.ai.prompt_aria", "Theme description prompt")}
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
            {t("theme.ai.to_generate", "to generate")}
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
            {isGenerating
              ? t("theme.ai.synthesizing", "Synthesizing…")
              : t("theme.ai.generate", "Generate theme")}
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
                {t("theme.ai.applied", {
                  mood: lastAnalysis.detectedMood,
                  defaultValue: "Applied · {{mood}}",
                })}
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
                    ? t("theme.ai.local_synthesis", {
                        preset: lastAnalysis.presetMatch,
                        defaultValue: "Local synthesis · {{preset}}",
                      })
                    : t("theme.ai.ai_synthesis", {
                        preset: lastAnalysis.presetMatch,
                        defaultValue: "AI synthesis · {{preset}}",
                      })
                }
                sx={{ fontWeight: 500, textTransform: "capitalize" }}
              />
              {contrastBadge && (
                <Chip
                  size="small"
                  variant="outlined"
                  color={contrastBadge.color}
                  label={t("theme.ai.body_text_contrast", {
                    rating: contrastBadge.label,
                    defaultValue: "Body text {{rating}}",
                  })}
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
            <AutoGrid min={180} gap={3}>
              {swatches.map((swatch) => (
                <SwatchReadout
                  key={swatch.label}
                  label={swatch.label}
                  hex={swatch.hex}
                />
              ))}
            </AutoGrid>
          </Box>
        </Box>
      )}

      {/* Curated starting points */}
      <Box>
        <SectionLabel
          action={
            <Typography variant="caption" color="text.secondary">
              {t(
                filteredSuggestions.length === 1
                  ? "theme.ai.style_count_one"
                  : "theme.ai.style_count_other",
                {
                  count: filteredSuggestions.length,
                  defaultValue:
                    filteredSuggestions.length === 1
                      ? "{{count}} style"
                      : "{{count}} styles",
                },
              )}
            </Typography>
          }
        >
          {t("theme.ai.style_inspiration", "Style inspiration")}
        </SectionLabel>

        <Stack
          direction="row"
          useFlexGap
          spacing={1.5}
          sx={{ flexWrap: "wrap", mb: 4 }}
        >
          {categories.map((cat) => (
            <ChoiceChip
              key={cat}
              label={categoryLabel(cat)}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
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
              {t(
                "theme.ai.no_styles",
                "No styles in this category yet — describe your own above.",
              )}
            </Typography>
          </Box>
        ) : (
          <AutoGrid min={220} gap={3}>
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
                  "&:focus-visible": focusRing,
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
          </AutoGrid>
        )}
      </Box>

      {/* Recent prompts */}
      {promptHistory.length > 0 && (
        <Box>
          <SectionLabel>
            {t("theme.ai.recent_prompts", "Recent prompts")}
          </SectionLabel>
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
                  "&:focus-visible": focusRing,
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
