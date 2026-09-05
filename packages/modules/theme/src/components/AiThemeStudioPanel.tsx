import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  Divider,
  CircularProgress,
  Paper,
  Tooltip,
} from "@mui/material";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Sparkles from "@mui/icons-material/AutoFixHigh";
import Palette from "@mui/icons-material/Palette";
import History from "@mui/icons-material/History";
import Tune from "@mui/icons-material/Tune";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { TenantThemeConfig } from "@cap/theme";
import {
  aiThemePromptService,
  CURATED_PROMPT_SUGGESTIONS,
  type PromptSuggestion,
  type PromptAnalysisResult,
  getWcagComplianceBadge,
} from "../services/aiThemePromptService";

export interface AiThemeStudioPanelProps {
  currentTheme: TenantThemeConfig;
  onThemeGenerated: (theme: TenantThemeConfig) => void;
}

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Banner / Header */}
      <Card
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
            theme.palette.info.main,
            0.04,
          )} 100%)`,
          border: "1px solid " + alpha(theme.palette.primary.main, 0.25),
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesome sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Natural Language Theme Studio
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Describe any visual aesthetic, brand identity, or mood to
                synthesize a complete tenant design system.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Prompt Input Area */}
      <Card
        sx={{ borderRadius: 3, border: "1px solid " + theme.palette.divider }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Sparkles fontSize="small" color="primary" />
            Enter Theme Prompt
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Cyberpunk dark HUD with neon cyan primary, magenta secondary, deep void background and glowing glass borders..."
            slotProps={{
              input: {
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                },
              },
            }}
          />

          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Tip: Include colors, mode (dark/light), effects (glass, brutalist,
              soft neu), and border geometry.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={
                isGenerating ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AutoAwesome />
                )
              }
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || isGenerating}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 800,
                textTransform: "none",
                bgcolor: "info.main",
                boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                "&:hover": { bgcolor: "info.dark" },
              }}
            >
              {isGenerating ? "Synthesizing..." : "Generate & Apply Theme"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Synthesis Breakdown Card */}
      {lastAnalysis && (
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid " + alpha(theme.palette.success.main, 0.3),
            bgcolor: alpha(theme.palette.success.main, 0.02),
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Check color="success" sx={{ fontSize: 20 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  {synthesisSource === "heuristic"
                    ? "Local Heuristic Synthesis: "
                    : "AI LLM Synthesis Active: "}
                  {lastAnalysis.detectedMood}
                </Typography>
              </Box>
              <Chip
                label={
                  synthesisSource === "heuristic"
                    ? `Heuristic (${lastAnalysis.presetMatch})`
                    : `LLM (${lastAnalysis.presetMatch})`
                }
                size="small"
                color={synthesisSource === "heuristic" ? "default" : "primary"}
                variant="outlined"
                sx={{ fontWeight: 700, textTransform: "capitalize" }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lastAnalysis.explanation}
            </Typography>

            <Divider sx={{ my: 2, opacity: 0.5 }} />

            {/*
              Color Swatch Preview - a CSS grid with `auto-fit`/`minmax`
              responds to *this card's* rendered width, unlike MUI's `Grid`
              breakpoints (`xs`/`sm`), which key off the browser viewport.
              This panel is mounted both full-page and inside a fixed
              ~560px drawer (see ThemeEditor's `asDrawer`); a viewport-based
              4-up grid stayed 4-up even in the narrow drawer on a wide
              monitor, squeezing every swatch into a sliver. auto-fit
              degrades to 2 or 1 columns exactly when the available width
              actually runs out, in either context.
            */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 2,
              }}
            >
              {(
                [
                  { label: "Primary", hex: lastAnalysis.primaryHex },
                  { label: "Secondary", hex: lastAnalysis.secondaryHex },
                  { label: "Background", hex: lastAnalysis.backgroundHex },
                  { label: "Surface", hex: lastAnalysis.surfaceHex },
                ] as const
              ).map((swatch) => (
                <Paper
                  key={swatch.label}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid " + theme.palette.divider,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: swatch.hex,
                      border: "1px solid rgba(0,0,0,0.1)",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: "block" }}
                    >
                      {swatch.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {swatch.hex}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Curated Prompt Suggestions */}
      <Card
        sx={{ borderRadius: 3, border: "1px solid " + theme.palette.divider }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Palette fontSize="small" color="primary" />
              Curated Style Inspiration
            </Typography>
          </Box>

          {/*
            Category Filter Chips - wraps onto multiple rows instead of
            scrolling horizontally. A hidden-overflow row let 2 of the 5
            categories go unseen unless a user discovered the scroll
            gesture (Hick's Law: choices need to be visible to be weighed);
            there are few enough categories that showing all of them
            up front costs only a little vertical space.
          */}
          <Stack
            direction="row"
            useFlexGap
            spacing={1}
            sx={{ mb: 3, flexWrap: "wrap" }}
          >
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                clickable
                onClick={() => setSelectedCategory(cat)}
                color={selectedCategory === cat ? "primary" : "default"}
                variant={selectedCategory === cat ? "filled" : "outlined"}
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              />
            ))}
          </Stack>

          {/*
            Suggestion Cards - same container-responsive grid as the swatch
            preview above, instead of a viewport-keyed 2-up `md` grid that
            stayed 2-up (and cramped) inside the narrow drawer.
          */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
            }}
          >
            {filteredSuggestions.map((suggestion) => (
                <Paper
                  key={suggestion.id}
                  elevation={0}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid " + theme.palette.divider,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 16px -4px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {suggestion.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          bgcolor: suggestion.previewColors.primary,
                        }}
                      />
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          bgcolor: suggestion.previewColors.secondary,
                        }}
                      />
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          bgcolor: suggestion.previewColors.background,
                          border: "1px solid #ccc",
                        }}
                      />
                    </Stack>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1.5, lineHeight: 1.4 }}
                  >
                    {suggestion.prompt}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    gap={0.5}
                  >
                    {suggestion.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          fontSize: "0.6875rem",
                          height: 20,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Prompt History */}
      {promptHistory.length > 0 && (
        <Card
          sx={{ borderRadius: 3, border: "1px solid " + theme.palette.divider }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <History fontSize="small" color="action" />
              Recent Prompt History
            </Typography>
            <Stack spacing={1}>
              {promptHistory.map((histPrompt, idx) => (
                <Box
                  key={idx}
                  onClick={() => {
                    setPrompt(histPrompt);
                    handleGenerate(histPrompt);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      pr: 2,
                    }}
                  >
                    {histPrompt}
                  </Typography>
                  <ArrowForward fontSize="small" color="action" />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AiThemeStudioPanel;
