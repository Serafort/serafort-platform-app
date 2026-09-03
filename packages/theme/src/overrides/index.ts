import { Theme } from '@mui/material/styles';
import { Skin } from '@cap/shared-types';
import { MuiMenuOverrides } from './MuiMenu';
import { MuiLayoutOverrides } from './MuiLayout';
import { MuiTableOverrides } from './MuiTable';
import coreOverrides from './core-overrides';

const getComponentOverrides = (theme: Theme, skin: Skin = 'default') => {
  return {
    ...coreOverrides(skin),
    ...MuiMenuOverrides(theme),
    ...MuiLayoutOverrides(theme),
    ...MuiTableOverrides(theme),
  };
};

export default getComponentOverrides;
