import React from "react";
import {
  Box,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from "@mui/material";
import type { ComponentStyles, ComponentEffectStyle } from "@cap/theme";
import type { EffectType } from "@cap/theme";

interface ComponentStyleSelectorProps {
  components: ComponentStyles;
  globalEffectType: EffectType;
  onChange: (components: ComponentStyles) => void;
  onGlobalChange: (type: EffectType) => void;
}

const componentLabels: Record<keyof ComponentStyles, string> = {
  button: "Buttons",
  card: "Cards",
  input: "Input Fields",
  navbar: "Navigation Bar",
  footer: "Footer",
  modal: "Modals",
  drawer: "Drawers",
  stepper: "Steppers",
  table: "Tables",
  tabs: "Tabs",
  nav: "Navigation Sidebars",
};

const effectOptions: {
  value: ComponentEffectStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "global",
    label: "Use Global",
    description: "Inherits global effect setting",
  },
  { value: "glass", label: "Glass", description: "Glassmorphism effect" },
  { value: "neu", label: "Neumorphic", description: "Soft 3D shadow effect" },
  {
    value: "standard",
    label: "Standard",
    description: "Traditional flat design",
  },
];

export const ComponentStyleSelector: React.FC<ComponentStyleSelectorProps> = ({
  components,
  globalEffectType,
  onChange,
  onGlobalChange,
}) => {
  const handleComponentChange = (
    key: keyof ComponentStyles,
    style: ComponentEffectStyle,
  ) => {
    onChange({
      ...components,
      [key]: {
        ...components[key],
        style,
      },
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Component Styles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Override the global effect for individual components or use global
        setting
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Global Effect Type
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {(["standard", "glass", "neu"] as EffectType[]).map((type) => (
            <Chip
              key={type}
              label={
                type === "standard"
                  ? "Standard"
                  : type === "glass"
                    ? "Glassmorphism"
                    : "Neumorphism"
              }
              onClick={() => onGlobalChange(type)}
              variant={globalEffectType === type ? "filled" : "outlined"}
              color={globalEffectType === type ? "primary" : "default"}
              sx={{ textTransform: "capitalize" }}
            />
          ))}
        </Box>
      </Box>

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Per-Component Overrides
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {(Object.keys(components) as Array<keyof ComponentStyles>).map(
          (key) => (
            <Box
              key={key}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                {componentLabels[key]}
              </Typography>
              <RadioGroup
                row
                value={components[key].style}
                onChange={(e) =>
                  handleComponentChange(
                    key,
                    e.target.value as ComponentEffectStyle,
                  )
                }
              >
                {effectOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </Box>
          ),
        )}
      </Box>
    </Paper>
  );
};

export default ComponentStyleSelector;
