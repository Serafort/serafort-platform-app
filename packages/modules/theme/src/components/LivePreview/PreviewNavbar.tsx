import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import styled from "@emotion/styled";

interface PreviewNavbarProps {
  effectStyle?: "standard" | "effect";
  label?: string;
}

const StandardNavbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-surface, #ffffff);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  border-radius: 8px 8px 0 0;
`;

/*
 * The effect surface is read from the same --effect-* custom properties the
 * app itself paints with, rather than a hand-written glass and neumorphic
 * variant. Those two were the only effects the preview could show, and they
 * showed fixed values - not the blur, tint or shadow the user had just set.
 */
const EffectNavbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--effect-bg, var(--color-surface, #ffffff));
  backdrop-filter: var(--effect-backdrop, none);
  -webkit-backdrop-filter: var(--effect-backdrop, none);
  border: var(--effect-border, 1px solid var(--color-border, #e2e8f0));
  border-radius: var(--effect-radius, 8px) var(--effect-radius, 8px) 0 0;
  box-shadow: var(--effect-shadow, none);
`;

const NavLink = styled.span<{ active?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: inherit;
  opacity: ${({ active }) => (active ? 1 : 0.7)};

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const PreviewNavbar: React.FC<PreviewNavbarProps> = ({
  effectStyle = "standard",
  label,
}) => {
  const NavbarComponent =
    effectStyle === "effect" ? EffectNavbar : StandardNavbar;

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
        {label ?? (effectStyle === "effect" ? "Effect" : "Standard")} Navbar
      </Typography>
      <NavbarComponent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ fontWeight: 600, fontSize: "1.125rem" }}>Logo</Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <NavLink active>Home</NavLink>
            <NavLink>About</NavLink>
            <NavLink>Services</NavLink>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
            JD
          </Avatar>
        </Box>
      </NavbarComponent>
    </Box>
  );
};

export default PreviewNavbar;
