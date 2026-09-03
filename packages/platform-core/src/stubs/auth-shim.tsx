import React from 'react';
import { Avatar } from '@mui/material';

/**
 * @cap/module-auth Shim
 *
 * Provides fallback implementations for Auth features when the real
 * @cap/module-auth package is not present in the workspace.
 */

// 1. Specific Components & Types
export interface CustomAvatarProps {
  skin?: 'light' | 'light-static' | 'filled';
  color?: any;
  size?: number;
  sx?: any;
  children?: React.ReactNode;
}

export const CustomAvatar = (props: CustomAvatarProps) => {
  const { skin, color, size, sx, children, ...rest } = props;
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        ...(sx || {})
      }}
      {...rest}
    >
      {children}
    </Avatar>
  );
};

export const RoleIndicator = (props: { showLabel?: boolean, size?: string }) => null;

import { AppPaths } from '@cap/shared-types';

// 2. Constants & Data Structures
export const Path = {
  auth: {
    signin: AppPaths.auth.login,
    signup: AppPaths.auth.register,
  },
  admin: {
    users: AppPaths.admin.users,
    roles: AppPaths.admin.roles,
  },
  account: {
    overview: AppPaths.account.settings,
    edit: AppPaths.account.settings,
  },
};

// 3. Hooks
export const useSignOut = (options?: { onSuccess?: () => void }) => {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const signOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      setIsSigningOut(false);
      options?.onSuccess?.();
    }, 500);
  };
  return { signOut, isSigningOut };
};

// 4. Plugins & Modules
export const initAuthPlugins = (plugins: any[]) => {
  console.info('[AuthShim] initAuthPlugins called (no-op)');
};

export const MFATOTPPlugin = { id: 'mfa-totp-shim' };

export const AuthModule = {
  id: 'auth-shim',
  name: 'Authentication Shim (Inactive)',
  version: '1.0.0',
};

// ── Default Export (Robust Fallback) ─────────────────────────────────────────

/**
 * The default export acts as a "Universal Fallback".
 * If imported as a component (e.g. CustomAvatar), it renders children.
 * If accessed for properties (e.g. Auth.Path), it provides them.
 */
const AuthShimBase: any = ({ children }: { children?: React.ReactNode }) => {
  return <>{children}</>;
};

// Attach properties for property-access style (e.g. Auth.Path)
AuthShimBase.Path = Path;
AuthShimBase.RoleIndicator = RoleIndicator;
AuthShimBase.useSignOut = useSignOut;
AuthShimBase.AuthModule = AuthModule;
AuthShimBase.CustomAvatar = CustomAvatar;
AuthShimBase.initAuthPlugins = initAuthPlugins;
AuthShimBase.MFATOTPPlugin = MFATOTPPlugin;

export default AuthShimBase;
