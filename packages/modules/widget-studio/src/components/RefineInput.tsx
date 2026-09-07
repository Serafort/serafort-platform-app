import React, { useState } from "react";
import { Box, Stack, Typography, Button, TextField } from "@mui/material";
import TuneRounded from "@mui/icons-material/TuneRounded";
import {
  CONTROL_HEIGHT,
  RADIUS,
  accentStrip,
  primaryAction,
  sectionLabel,
  suggestionPill,
} from "../theme/studioStyles";

interface RefineInputProps {
  onRefine: (instruction: string) => void;
  disabled?: boolean;
  /** A one-line reply when a refinement could not be applied. */
  notice?: string | null;
}

/**
 * Shortcuts for the asks that are pure geometry. These are applied locally,
 * without a model round-trip, so they land instantly - see refineDraft.ts.
 */
const QUICK_REFINEMENTS = ["Wider", "Narrower", "Taller", "Shorter"];

/**
 * "Change this widget" rather than "describe a new one".
 *
 * The studio was one-shot: if the widget came back right but too small, the
 * only move was to rewrite the whole prompt and hope for the same widget.
 */
const RefineInput: React.FC<RefineInputProps> = ({
  onRefine,
  disabled,
  notice,
}) => {
  const [value, setValue] = useState("");

  const submit = (instruction: string) => {
    const trimmed = instruction.trim();
    if (!trimmed || disabled) return;
    onRefine(trimmed);
    setValue("");
  };

  return (
    <Box sx={(theme) => ({ ...accentStrip(theme), p: 3.5 })}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
        <TuneRounded sx={{ fontSize: 16, color: "primary.main" }} />
        <Typography sx={{ ...sectionLabel, color: "text.secondary" }}>
          Refine this widget
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          size="small"
          id="widget-studio-refine-input"
          placeholder="Show the last 12 months"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(value);
            }
          }}
          disabled={disabled}
          sx={(theme) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.control,
              backgroundColor: theme.palette.background.paper,
              fontSize: "0.84375rem",
              minHeight: CONTROL_HEIGHT,
            },
          })}
        />
        <Button
          id="widget-studio-refine-btn"
          variant="contained"
          onClick={() => submit(value)}
          disabled={disabled || !value.trim()}
          sx={{ ...primaryAction, flexShrink: 0, px: 4 }}
        >
          Refine
        </Button>
      </Stack>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2.5 }}>
        {QUICK_REFINEMENTS.map((label) => (
          <Box
            component="button"
            type="button"
            key={label}
            disabled={disabled}
            onClick={() => submit(label.toLowerCase())}
            sx={(theme) => ({
              ...suggestionPill(theme),
              px: 2.5,
              font: "inherit",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            })}
          >
            {label}
          </Box>
        ))}
      </Box>

      {notice && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", mt: 2 }}
        >
          {notice}
        </Typography>
      )}
    </Box>
  );
};

export default RefineInput;
