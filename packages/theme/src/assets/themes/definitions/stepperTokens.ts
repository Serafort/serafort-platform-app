/**
 * Stepper Design Tokens
 * Centralizes layout dimensions, connector widths, step number font styles, and responsive alignment rules for steppers.
 */

export interface StepperTokens {
  connector: {
    borderBlockStartWidth: number
    borderRadius: number
    alternativeLabelTop: number
  }
  vertical: {
    stepContentBorderInlineStartWidth: number
    stepContentMarginLeftSpacing: number
    buttonWrapperMarginTopSpacing: number
  }
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
}
