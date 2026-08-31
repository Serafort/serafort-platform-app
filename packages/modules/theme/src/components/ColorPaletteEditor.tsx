import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import type { ColorToken } from '@cap/theme';
import { getWcagComplianceBadge } from '../services/aiThemePromptService';

interface ColorPaletteEditorProps {
  colors: Record<string, ColorToken>;
  onChange: (colors: Record<string, ColorToken>) => void;
}

const colorLabels: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  textMuted: 'Text Muted',
  border: 'Border',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
};

const ColorSwatch = ({ color, label, onColorChange, contrastTarget }: {
  color: ColorToken;
  label: string;
  onColorChange: (value: string) => void;
  contrastTarget?: string;
}) => {
  const contrastBadge = contrastTarget ? getWcagComplianceBadge(color.value, contrastTarget) : null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          component="label"
          title="Pick color"
          sx={{
            position: 'relative',
            width: 48,
            height: 48,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: color.value,
            }}
          />
          <input
            type="color"
            value={color.value}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label={`Pick color for ${label}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </Box>
        <TextField
          size="small"
          value={color.value}
          onChange={(e) => onColorChange(e.target.value)}
          placeholder="#000000"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    background: `linear-gradient(45deg, #fff 45%, #000 45%, #000 55%, #fff 55%)`,
                    backgroundSize: '8px 8px',
                    opacity: 0.3,
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {color.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {color.description}
        </Typography>
      )}
      {contrastBadge && (
        <Chip 
          size="small" 
          label={contrastBadge.label} 
          color={contrastBadge.color} 
          sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} 
        />
      )}
    </Box>
  );
};

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({
  colors,
  onChange,
}) => {
  const handleColorChange = (key: string, value: string) => {
    onChange({
      ...colors,
      [key]: {
        ...colors[key],
        value,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Color Palette
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize the color scheme for your organization's theme.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Brand Colors
            </Typography>
            <ColorSwatch
              color={colors.primary || { value: '#6366f1' }}
              label={colorLabels.primary}
              contrastTarget={colors.background?.value || '#f8fafc'}
              onColorChange={(value) => handleColorChange('primary', value)}
            />
            <ColorSwatch
              color={colors.secondary || { value: '#8b5cf6' }}
              label={colorLabels.secondary}
              contrastTarget={colors.background?.value || '#f8fafc'}
              onColorChange={(value) => handleColorChange('secondary', value)}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Surface Colors
            </Typography>
            <ColorSwatch
              color={colors.background || { value: '#f8fafc' }}
              label={colorLabels.background}
              onColorChange={(value) => handleColorChange('background', value)}
            />
            <ColorSwatch
              color={colors.surface || { value: '#ffffff' }}
              label={colorLabels.surface}
              onColorChange={(value) => handleColorChange('surface', value)}
            />
            <ColorSwatch
              color={colors.border || { value: '#e2e8f0' }}
              label={colorLabels.border}
              onColorChange={(value) => handleColorChange('border', value)}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Text Colors
            </Typography>
            <ColorSwatch
              color={colors.text || { value: '#0f172a' }}
              label={colorLabels.text}
              contrastTarget={colors.background?.value || '#f8fafc'}
              onColorChange={(value) => handleColorChange('text', value)}
            />
            <ColorSwatch
              color={colors.textMuted || { value: '#64748b' }}
              label={colorLabels.textMuted}
              contrastTarget={colors.background?.value || '#f8fafc'}
              onColorChange={(value) => handleColorChange('textMuted', value)}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Semantic Colors
            </Typography>
            <ColorSwatch
              color={colors.success || { value: '#22c55e' }}
              label={colorLabels.success}
              onColorChange={(value) => handleColorChange('success', value)}
            />
            <ColorSwatch
              color={colors.warning || { value: '#f59e0b' }}
              label={colorLabels.warning}
              onColorChange={(value) => handleColorChange('warning', value)}
            />
            <ColorSwatch
              color={colors.error || { value: '#ef4444' }}
              label={colorLabels.error}
              onColorChange={(value) => handleColorChange('error', value)}
            />
            <ColorSwatch
              color={colors.info || { value: '#3b82f6' }}
              label={colorLabels.info}
              onColorChange={(value) => handleColorChange('info', value)}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ColorPaletteEditor;
