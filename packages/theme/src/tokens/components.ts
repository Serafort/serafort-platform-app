/**
 * Tier 3: The 4 UI States & Component Token Contracts
 * Element-bound contracts: 4 UI States (Idle/Empty, Loading/Shimmer, Error/Lockout, Success/Feedback),
 * Form, Input, Button, and Modal token contracts.
 */

export interface StateComponentTokens {
  // 1. Idle & Empty States
  empty: {
    iconSize: string; // '48px'
    iconColor: string; // 'var(--color-text-tertiary)'
    titleTypography: string; // 'var(--font-heading)'
    canvasDashedBorder: string; // '1px dashed var(--surface-border)'
  };

  // 2. Loading State (Psychology & Skeletons)
  loading: {
    skeletonBase: string; // 'var(--surface-subtle)'
    skeletonHighlight: string; // 'var(--surface-paper)'
    shimmerDuration: string; // '1.5s ease-in-out infinite'
    actionLockDuration: number; // 120ms
    spinnerTrack: string; // 'var(--surface-border)'
  };

  // 3. Error & Lockout State (Non-punitive Dark UX Guard)
  error: {
    fieldBorder: string; // '1px solid var(--color-error-500)'
    fieldFocusRing: string; // '0 0 0 3px rgba(239, 68, 68, 0.2)'
    badgeBackground: string; // 'rgba(239, 68, 68, 0.12)'
    messageColor: string; // 'var(--color-error-600)'
  };

  // 4. Success State
  success: {
    iconCheckColor: string; // 'var(--color-success-500)'
    glowHighlight: string; // '0 0 12px rgba(16, 185, 129, 0.35)'
    bannerBackground: string; // 'rgba(16, 185, 129, 0.08)'
  };
}

export const stateComponentTokens: StateComponentTokens = {
  empty: {
    iconSize: "48px",
    iconColor: "var(--color-text-tertiary, #94A3B8)",
    titleTypography:
      "var(--font-heading, clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem))",
    canvasDashedBorder:
      "1px dashed var(--surface-border, rgba(255, 255, 255, 0.08))",
  },
  loading: {
    skeletonBase: "var(--surface-subtle, #1E1E28)",
    skeletonHighlight: "var(--surface-paper, #17171F)",
    shimmerDuration: "1.5s ease-in-out infinite",
    actionLockDuration: 120, // 120ms
    spinnerTrack: "var(--surface-border, rgba(255, 255, 255, 0.08))",
  },
  error: {
    fieldBorder: "1px solid var(--color-error-500, #EF4444)",
    fieldFocusRing: "0 0 0 3px rgba(239, 68, 68, 0.2)",
    badgeBackground: "rgba(239, 68, 68, 0.12)",
    messageColor: "var(--color-error-600, #DC2626)",
  },
  success: {
    iconCheckColor: "var(--color-success-500, #10B981)",
    glowHighlight: "0 0 12px rgba(16, 185, 129, 0.35)",
    bannerBackground: "rgba(16, 185, 129, 0.08)",
  },
};

/**
 * Form & Input Token Contract (Floating Labels & High Touch Targets)
 */
export const formTokens = {
  input: {
    height: "48px", // Mobile-accessible touch target
    radius: "var(--radius-md, 8px)",
    paddingInline: "16px",
    background: "var(--surface-subtle, #1E1E28)",
    border: "1px solid var(--surface-border, rgba(255, 255, 255, 0.08))",
    focusBorder: "1px solid var(--color-brand-500, #6366F1)",
    focusRing: "0 0 0 3px rgba(99, 102, 241, 0.15)",
    floatingLabelScale: "0.75",
    floatingLabelTranslate: "translate(14px, -9px)",
  },
  button: {
    heightPrimary: "44px",
    heightLarge: "52px",
    radius: "var(--radius-md, 8px)",
    primaryBg: "var(--color-brand-600, #4F46E5)",
    primaryHoverBg: "var(--color-brand-700, #4338CA)",
    primaryActiveBg: "var(--color-brand-800, #3730A3)",
    disabledOpacity: "0.45",
  },
  modal: {
    backdropFilter: "blur(8px)",
    backdropBg: "rgba(0, 0, 0, 0.65)",
    radius: "var(--radius-xl, 16px)",
    maxWidth: "480px",
  },
} as const;

export type FormTokens = typeof formTokens;

/**
 * UI State Style Mixin helper for styled-components / Emotion styles
 */
export const getStateStyles = (state: keyof StateComponentTokens) => {
  switch (state) {
    case "empty":
      return {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        border: stateComponentTokens.empty.canvasDashedBorder,
        borderRadius: "var(--radius-lg, 12px)",
        padding: "32px 24px",
        textAlign: "center" as const,
        "& .state-empty-icon": {
          fontSize: stateComponentTokens.empty.iconSize,
          color: stateComponentTokens.empty.iconColor,
          marginBottom: "12px",
        },
        "& .state-empty-title": {
          font: stateComponentTokens.empty.titleTypography,
        },
      };
    case "loading":
      return {
        position: "relative" as const,
        overflow: "hidden",
        backgroundColor: stateComponentTokens.loading.skeletonBase,
        "&::after": {
          content: '""',
          position: "absolute" as const,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          transform: "translateX(-100%)",
          backgroundImage: `linear-gradient(90deg, transparent, ${stateComponentTokens.loading.skeletonHighlight}, transparent)`,
          animation: `shimmer ${stateComponentTokens.loading.shimmerDuration}`,
        },
      };
    case "error":
      return {
        border: stateComponentTokens.error.fieldBorder,
        "&:focus-within": {
          boxShadow: stateComponentTokens.error.fieldFocusRing,
        },
        "& .state-error-message": {
          color: stateComponentTokens.error.messageColor,
          fontSize: "var(--font-caption, 0.75rem)",
          marginTop: "4px",
        },
      };
    case "success":
      return {
        boxShadow: stateComponentTokens.success.glowHighlight,
        backgroundColor: stateComponentTokens.success.bannerBackground,
        "& .state-success-icon": {
          color: stateComponentTokens.success.iconCheckColor,
        },
      };
    default:
      return {};
  }
};
