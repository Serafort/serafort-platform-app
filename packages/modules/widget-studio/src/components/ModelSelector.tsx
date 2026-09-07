import React from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import SmartToyRounded from "@mui/icons-material/SmartToyRounded";
import { useAppStore } from "@cap/platform-store";
import { AVAILABLE_LLM_MODELS, type ProviderType } from "@cap/shared-types";
import {
  CONTROL_HEIGHT,
  RADIUS,
  suggestionPill,
} from "../theme/studioStyles";

const PROVIDERS: Array<{ id: ProviderType; label: string }> = [
  { id: "openrouter", label: "OpenRouter" },
  { id: "gemini", label: "Gemini" },
];

/**
 * Provider + model picker.
 *
 * It sits inside the prompt strip now, so it no longer draws its own card:
 * a bordered, tinted box nested inside another bordered, tinted box read as
 * two competing panels. The provider switch is a pair of pills that share the
 * panel's one accent - the second used to be `color="secondary"`, which made
 * "which provider is selected" a question of telling two brand colours apart.
 */
export const ModelSelector: React.FC = React.memo(() => {
  const selectedProvider = useAppStore((state) => state.selectedProvider);
  const selectedModel = useAppStore((state) => state.selectedModel);
  const setSelectedProvider = useAppStore((state) => state.setSelectedProvider);
  const setSelectedModel = useAppStore((state) => state.setSelectedModel);

  const filteredModels = AVAILABLE_LLM_MODELS.filter(
    (m) => m.provider === selectedProvider,
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* No label: the panel already says what this block is for, and two
          stacked uppercase labels read as two sections rather than one. The
          pill names say what they are. */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        {PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;
          return (
            <Box
              component="button"
              type="button"
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              aria-pressed={isSelected}
              sx={(theme) => ({
                ...suggestionPill(theme),
                height: 28,
                px: 2.5,
                font: "inherit",
                fontSize: "0.71875rem",
                fontWeight: 600,
                cursor: "pointer",
                ...(isSelected && {
                  backgroundColor: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                    borderColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                  },
                }),
              })}
            >
              {provider.label}
            </Box>
          );
        })}
      </Box>

      {/* Model Dropdown */}
      <FormControl fullWidth size="small">
        <Select
          id="widget-studio-model-selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          // The outline colour is deliberately left to the app's own input
          // styling: every other form control in the product carries it, and a
          // lighter border here would make this the one field that looks
          // different.
          sx={{
            borderRadius: RADIUS.control,
            fontSize: "0.8125rem",
            minHeight: CONTROL_HEIGHT,
            bgcolor: "background.paper",
            "& .MuiSelect-select": {
              py: 0,
              minHeight: CONTROL_HEIGHT,
              display: "flex",
              alignItems: "center",
              gap: 2,
            },
          }}
        >
          {filteredModels.map((model) => (
            <MenuItem
              key={model.id}
              value={model.id}
              title={model.description || ""}
              sx={{ fontSize: "0.8125rem" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SmartToyRounded
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {model.name}
                  </Typography>
                </Box>
                {model.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {model.description}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});

ModelSelector.displayName = "ModelSelector";
