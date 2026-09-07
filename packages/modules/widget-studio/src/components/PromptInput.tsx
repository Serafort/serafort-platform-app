import React, { useState, useCallback, useRef } from "react";
import { Box, TextField, IconButton, Typography, CircularProgress } from "@mui/material";
import SendRounded from "@mui/icons-material/SendRounded";
import { ModelSelector } from "./ModelSelector";
import { CONTROL_HEIGHT, RADIUS, suggestionPill } from "../theme/studioStyles";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  isRunning?: boolean;
}

const EXAMPLE_PROMPTS = [
  "KPI card of active users",
  "Revenue chart, last 6 months",
  "Table of recent orders",
  "AI chat assistant",
];

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  disabled,
  isRunning,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isRunning) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, disabled, isRunning, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isBusy = Boolean(disabled) || Boolean(isRunning);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Dynamic LLM Provider & Model Selector */}
      <ModelSelector />

      {/* Prompt input + send */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <TextField
          inputRef={inputRef}
          multiline
          maxRows={4}
          fullWidth
          placeholder="A gauge of server CPU and memory"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy}
          size="small"
          id="widget-studio-prompt-input"
          sx={(theme) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.control,
              backgroundColor: theme.palette.background.paper,
              fontSize: "0.84375rem",
              minHeight: CONTROL_HEIGHT,
              alignItems: "center",
            },
          })}
        />
        <IconButton
          id="widget-studio-send-btn"
          onClick={handleSubmit}
          disabled={!value.trim() || isBusy}
          aria-label="Generate widget"
          sx={(theme) => ({
            width: CONTROL_HEIGHT,
            height: CONTROL_HEIGHT,
            flexShrink: 0,
            borderRadius: RADIUS.control,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            transition: theme.transitions.create("background-color", {
              duration: 150,
            }),
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
          })}
        >
          {isRunning ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendRounded sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* Example prompts. Quiet pills, not chips that invert to a solid accent
          on hover - four of those competing with the send button was the
          loudest thing in the panel, and they read as filters rather than as
          examples you can start from. */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {EXAMPLE_PROMPTS.map((example) => (
          <Box
            component="button"
            type="button"
            key={example}
            disabled={isBusy}
            onClick={() => !isBusy && onSubmit(example)}
            sx={(theme) => ({
              ...suggestionPill(theme),
              px: 2.5,
              font: "inherit",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
            })}
          >
            {example}
          </Box>
        ))}
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.6875rem", opacity: 0.85 }}
      >
        Enter to generate · Shift+Enter for a new line
      </Typography>
    </Box>
  );
};

export default PromptInput;
