/**
 * Stepper Design Tokens
 * Centralizes layout dimensions, connector widths, step number font styles, and responsive alignment rules for steppers.
 */

export interface StepperTokens {
  connector: {
    borderBlockStartWidth: number;
    borderRadius: number;
    alternativeLabelTop: number;
  };
  vertical: {
    stepContentBorderInlineStartWidth: number;
    stepContentMarginLeftSpacing: number;
    buttonWrapperMarginTopSpacing: number;
  };
  progress: {
    badgeBorderRadius: string;
    badgeFontSize: string;
    badgeFontWeight: number;
    stepIndicatorLetterSpacing: string;
    stepTransitionDuration: string;
    completionGradient: string;
  };
}

export const stepperTokens: StepperTokens = {
  connector: {
    borderBlockStartWidth: 3,
    borderRadius: 3,
    alternativeLabelTop: 10,
  },
  vertical: {
    stepContentBorderInlineStartWidth: 3,
    stepContentMarginLeftSpacing: 2.25,
    buttonWrapperMarginTopSpacing: 4,
  },
  progress: {
    badgeBorderRadius: "50px",
    badgeFontSize: "0.75rem",
    badgeFontWeight: 700,
    stepIndicatorLetterSpacing: "0.05em",
    stepTransitionDuration: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    completionGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  },
};
