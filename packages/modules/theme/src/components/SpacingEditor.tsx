import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
} from '@mui/material';


interface SpacingEditorProps {
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  onSpacingChange: (spacing: Record<string, string>) => void;
  onBorderRadiusChange: (borderRadius: Record<string, string>) => void;
}

const spacingLabels: Record<string, string> = {
  xs: 'Extra Small',
  sm: 'Small',
  md: 'Medium (Default)',
  lg: 'Large',
  xl: 'Extra Large',
  '2xl': '2x Extra Large',
};

const borderRadiusLabels: Record<string, string> = {
  none: 'None (0px)',
  sm: 'Small (4px)',
  md: 'Medium (8px)',
  lg: 'Large (12px)',
  xl: 'Extra Large (16px)',
  full: 'Full (pill shape)',
};

export const SpacingEditor: React.FC<SpacingEditorProps> = ({
  spacing,
  borderRadius,
  onSpacingChange,
  onBorderRadiusChange,
}) => {
  const handleSpacingChange = (key: string, value: string) => {
    onSpacingChange({ ...spacing, [key]: value });
  };

  const handleBorderRadiusChange = (key: string, value: string) => {
    onBorderRadiusChange({ ...borderRadius, [key]: value });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Spacing & Border Radius
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize spacing scale and border radius values
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Spacing Scale
          </Typography>
          {Object.entries(spacingLabels).map(([key, label]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <TextField
                size="small"
                value={spacing[key] || '1rem'}
                onChange={(e) => handleSpacingChange(key, e.target.value)}
                placeholder="1rem"
                sx={{ width: 150 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (e.g., 8px, 1rem, 0.5em)
              </Typography>
            </Box>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Border Radius
          </Typography>
          {Object.entries(borderRadiusLabels).map(([key, label]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <TextField
                size="small"
                value={borderRadius[key] || '0px'}
                onChange={(e) => handleBorderRadiusChange(key, e.target.value)}
                placeholder="8px"
                sx={{ width: 150 }}
              />
              <Box
                sx={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  ml: 2,
                  backgroundColor: 'primary.main',
                  borderRadius: borderRadius[key] || '0px',
                  verticalAlign: 'middle',
                }}
              />
            </Box>
          ))}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Preview
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            p: 3,
            backgroundColor: 'background.default',
            borderRadius: 1,
          }}
        >
          {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((key) => (
            <Box
              key={key}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'primary.main',
                borderRadius: borderRadius[key] || '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'primary.contrastText' }}>
                {key}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default SpacingEditor;
