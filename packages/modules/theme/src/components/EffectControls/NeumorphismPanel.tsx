import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import type { NeumorphismConfig } from '@cap/theme';
import { computeNeumorphismBoxShadow } from '@cap/theme';

interface NeumorphismPanelProps {
  config: NeumorphismConfig;
  onChange: (config: NeumorphismConfig) => void;
}

export const NeumorphismPanel: React.FC<NeumorphismPanelProps> = ({
  config,
  onChange,
}) => {
  const handleChange = <K extends keyof NeumorphismConfig>(
    key: K,
    value: NeumorphismConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const shadow = computeNeumorphismBoxShadow(config);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6">Neumorphism</Typography>
          <Typography variant="body2" color="text.secondary">
            Soft 3D effect with subtle shadows
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
          Enable neumorphism to customize its properties
        </Typography>
      )}

      {config.enabled && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Background Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  backgroundColor: config.backgroundColor,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {config.backgroundColor}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Intensity: {((config.intensity ?? 0.15) * 100).toFixed(0)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Shadow darkness and spread
            </Typography>
            <Slider
              value={(config.intensity ?? 0.15) * 100}
              onChange={(_, value) => handleChange('intensity', (value as number) / 100)}
              min={5}
              max={40}
              step={1}
              marks={[
                { value: 5, label: '5%' },
                { value: 20, label: '20%' },
                { value: 40, label: '40%' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Distance: {config.distance || 10}px
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Offset distance of shadows
            </Typography>
            <Slider
              value={config.distance || 10}
              onChange={(_, value) => handleChange('distance', value as number)}
              min={0}
              max={20}
              step={1}
              marks={[
                { value: 0, label: '0px' },
                { value: 10, label: '10px' },
                { value: 20, label: '20px' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Altitude: {config.altitude || 15}°
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Light source angle
            </Typography>
            <Slider
              value={config.altitude || 15}
              onChange={(_, value) => handleChange('altitude', value as number)}
              min={0}
              max={45}
              step={1}
              marks={[
                { value: 0, label: '0°' },
                { value: 22.5, label: '22.5°' },
                { value: 45, label: '45°' },
              ]}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Border Radius: {config.borderRadius || '12px'}
            </Typography>
            <Slider
              value={parseInt(config.borderRadius || '12') || 12}
              onChange={(_, value) => handleChange('borderRadius', `${value}px`)}
              min={0}
              max={32}
              step={2}
              marks={[
                { value: 0, label: '0px' },
                { value: 12, label: '12px' },
                { value: 24, label: '24px' },
                { value: 32, label: '32px' },
              ]}
            />
          </Box>

          <Box sx={{ mt: 4, p: 3, backgroundColor: config.backgroundColor, borderRadius: (parseInt(config.borderRadius || '12') || 12) / 4 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Neumorphism Preview
            </Typography>
            <Box
              sx={{
                p: 2,
                mt: 2,
                backgroundColor: config.backgroundColor,
                borderRadius: (parseInt(config.borderRadius || '12') || 12) / 8 || 1.5,
                boxShadow: shadow,
              }}
            >
              <Typography variant="caption">
                This is how your buttons will look with neumorphism
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default NeumorphismPanel;
