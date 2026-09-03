import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import styled from '@emotion/styled';

interface PreviewNavbarProps {
  effectStyle?: 'standard' | 'glass' | 'neu';
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

const GlassNavbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px 8px 0 0;
`;

const NeuNavbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #e0e5ec;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const NavLink = styled.span<{ active?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: inherit;
  opacity: ${({ active }) => active ? 1 : 0.7};

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const PreviewNavbar: React.FC<PreviewNavbarProps> = ({
  effectStyle = 'standard',
}) => {
  const NavbarComponent = effectStyle === 'glass' ? GlassNavbar : effectStyle === 'neu' ? NeuNavbar : StandardNavbar;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {effectStyle === 'glass' ? 'Glass' : effectStyle === 'neu' ? 'Neumorphic' : 'Standard'} Navbar
      </Typography>
      <NavbarComponent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Logo</Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <NavLink active>Home</NavLink>
            <NavLink>About</NavLink>
            <NavLink>Services</NavLink>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>JD</Avatar>
        </Box>
      </NavbarComponent>
    </Box>
  );
};

export default PreviewNavbar;
