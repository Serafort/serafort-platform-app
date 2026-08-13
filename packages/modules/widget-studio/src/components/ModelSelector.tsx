import React from 'react'
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material'
import SmartToyRounded from '@mui/icons-material/SmartToyRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import { useAppStore } from '@cap/platform-store'
import { AVAILABLE_LLM_MODELS, type ProviderType } from '@cap/shared-types'

export const ModelSelector: React.FC = React.memo(() => {
  const selectedProvider = useAppStore((state) => state.selectedProvider)
  const selectedModel = useAppStore((state) => state.selectedModel)
  const setSelectedProvider = useAppStore((state) => state.setSelectedProvider)
  const setSelectedModel = useAppStore((state) => state.setSelectedModel)

  const filteredModels = AVAILABLE_LLM_MODELS.filter(
    (m) => m.provider === selectedProvider
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.5,
        borderRadius: 2,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(0,0,0,0.02)',
        border: '1px solid',
        borderColor: 'divider',
        mb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <AutoAwesomeRounded sx={{ fontSize: 14, color: 'primary.main' }} />
          AI Engine & Model
        </Typography>

        {/* Provider Switcher Chips */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            label="OpenRouter"
            size="small"
            variant={selectedProvider === 'openrouter' ? 'filled' : 'outlined'}
            color={selectedProvider === 'openrouter' ? 'primary' : 'default'}
            onClick={() => setSelectedProvider('openrouter')}
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label="Gemini Native"
            size="small"
            variant={selectedProvider === 'gemini' ? 'filled' : 'outlined'}
            color={selectedProvider === 'gemini' ? 'secondary' : 'default'}
            onClick={() => setSelectedProvider('gemini')}
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
          />
        </Box>
      </Box>

      {/* Model Dropdown */}
      <FormControl fullWidth size="small">
        <Select
          id="widget-studio-model-selector"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          sx={{
            borderRadius: 1.5,
            fontSize: '0.8125rem',
            bgcolor: 'background.paper',
            '& .MuiSelect-select': {
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {filteredModels.map((model) => (
            <MenuItem key={model.id} value={model.id} title={model.description || ''} sx={{ fontSize: '0.8125rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyRounded sx={{ fontSize: 16, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {model.name}
                  </Typography>
                </Box>
                {model.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.75, ml: 1 }}>
                    {model.description}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
})

ModelSelector.displayName = 'ModelSelector'

