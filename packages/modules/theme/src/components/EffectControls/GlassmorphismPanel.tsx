import React from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import type { GlassmorphismConfig } from '@cap/theme';

interface GlassmorphismPanelProps {
  config: GlassmorphismConfig;
  onChange: (config: GlassmorphismConfig) => void;
}

export const GlassmorphismPanel: React.FC<GlassmorphismPanelProps> = ({
  config,
  onChange,
}) => {
  const handleChange = <K extends keyof GlassmorphismConfig>(
    key: K,
    value: GlassmorphismConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6">Glassmorphism</Typography>
          <Typography variant="body2" color="text.secondary">
            Frosted glass effect with blur and transparency
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={config.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
            />
          }
          label="Enable"
          labelPlacement="start"
        />
      </Box>

      {!config.enabled && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Enable glassmorphism to customize its properties
        </Typography>
      )}

      {config.enabled && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Blur Intensity: {config.blur || '16px'}
            </Typography>
            <Slider
              value={parseInt(config.blur || '16') || 16}
              onChange={(_, value) => handleChange('blur', `${value}px`)}
              min={0}
              max={50}
              step={1}
              marks={[
                { value: 0, label: '0px' },
                { value: 16, label: '16px' },
                { value: 32, label: '32px' },
                { value: 50, label: '50px' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Opacity: {((config.opacity ?? 0.8) * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={(config.opacity ?? 0.8) * 100}
              onChange={(_, value) => handleChange('opacity', (value as number) / 100)}
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Background Color
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={config.background || ''}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="rgba(255, 255, 255, 0.1)"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Use rgba() format for transparency
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Border Color
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={config.borderColor || ''}
              onChange={(e) => handleChange('borderColor', e.target.value)}
              placeholder="rgba(255, 255, 255, 0.2)"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Border Width: {config.borderWidth || '1px'}
            </Typography>
            <Slider
              value={parseInt(config.borderWidth || '1') || 1}
              onChange={(_, value) => handleChange('borderWidth', `${value}px`)}
              min={0}
              max={5}
              step={1}
              marks={[
                { value: 0, label: '0px' },
                { value: 1, label: '1px' },
                { value: 2, label: '2px' },
                { value: 5, label: '5px' },
              ]}
            />
          </Box>

          <Box
            sx={{
              mt: 4,
              p: 3,
              background: config.background,
              backdropFilter: `blur(${config.blur})`,
              WebkitBackdropFilter: `blur(${config.blur})`,
              border: `${config.borderWidth} solid ${config.borderColor}`,
              borderRadius: 2,
              opacity: config.opacity,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Glassmorphism Preview
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              This is how your cards will look with glassmorphism enabled
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default GlassmorphismPanel;
