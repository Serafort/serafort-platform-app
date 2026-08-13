import React, { useState, useCallback, useRef } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material'
import SendRounded from '@mui/icons-material/SendRounded'
import AutoFixHighRounded from '@mui/icons-material/AutoFixHighRounded'
import { ModelSelector } from './ModelSelector'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
  isRunning?: boolean
}

const EXAMPLE_PROMPTS = [
  'Create a KPI card showing total active users',
  'Build a revenue chart for the last 6 months',
  'Show me a table of recent orders',
  'Add an AI chat assistant widget',
]

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, disabled, isRunning }) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isRunning) return
    onSubmit(trimmed)
    setValue('')
  }, [value, disabled, isRunning, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Dynamic LLM Provider & Model Selector */}
      <ModelSelector />

      {/* Example prompt chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {EXAMPLE_PROMPTS.map((example) => (
          <Chip
            key={example}
            label={example}
            size="small"
            variant="outlined"
            icon={<AutoFixHighRounded sx={{ fontSize: '0.8rem !important' }} />}
            onClick={() => !disabled && !isRunning && onSubmit(example)}
            sx={{
              fontSize: '0.7rem',
              cursor: disabled || isRunning ? 'not-allowed' : 'pointer',
              opacity: disabled || isRunning ? 0.5 : 1,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiChip-icon': { color: 'primary.contrastText' },
              },
            }}
          />
        ))}
      </Box>

      {/* Prompt input + send */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          inputRef={inputRef}
          multiline
          maxRows={4}
          fullWidth
          placeholder="Describe the widget you want to create…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isRunning}
          size="small"
          id="widget-studio-prompt-input"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.875rem',
              transition: 'box-shadow 0.2s ease',
              '&.Mui-focused': {
                boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}22`,
              },
            },
          }}
        />
        <IconButton
          id="widget-studio-send-btn"
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || isRunning}
          color="primary"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 40,
            height: 40,
            borderRadius: 2,
            flexShrink: 0,
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
          }}
        >
          {isRunning ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendRounded sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'right', fontSize: '0.68rem' }}>
        Press Enter to generate · Shift+Enter for new line
      </Typography>
    </Box>
  )
}

export default PromptInput
