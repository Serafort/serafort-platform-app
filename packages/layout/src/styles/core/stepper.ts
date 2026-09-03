import { Box, styled, stepperTokens } from '@cap/theme'
import type { BoxProps } from '@mui/material/Box'

const StepperWrapper = styled(Box)<BoxProps>(({ theme }) => {
  return {
    [theme.breakpoints.down('md')]: {
      '& .MuiStepper-horizontal:not(.MuiStepper-alternativeLabel)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    '& .MuiStep-root': {
      '& .MuiStepLabel-iconContainer:empty': {
        display: 'none',
      },
      '& .step-label': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '& .MuiAvatar-root': {
          marginInlineEnd: theme.spacing(3),
        },
      },
      '& .step-number': {
        ...theme.typography.h4,
        marginRight: theme.spacing(2),
        color: `${theme.palette.text.primary} !important`,
      },
      '& .step-title': {
        ...theme.typography.body1,
        fontWeight: 500,
        color: theme.palette.text.primary,
      },
      '& .step-subtitle': {
        ...theme.typography.body2,
      },
      '& .MuiStepLabel-root.Mui-disabled': {
        '& .step-number': {
          color: theme.palette.text.disabled,
        },
      },
      '& .Mui-error': {
        '& .MuiStepLabel-labelContainer, & .step-number, & .step-title, & .step-subtitle': {
          color: `${theme.palette.error.main} !important`,
        },
      },
    },
    '& .MuiStepConnector-root': {
      '& .MuiStepConnector-line': {
        borderBlockStartWidth: stepperTokens.connector.borderBlockStartWidth,
        borderRadius: stepperTokens.connector.borderRadius,
      },
      '&.Mui-active, &.Mui-completed': {
        '& .MuiStepConnector-line': {
          borderColor: theme.palette.primary.main,
        },
      },
      '&.Mui-disabled .MuiStepConnector-line': {
        borderColor: theme.palette.action.disabledBackground || theme.palette.primary.light,
      },
    },
    '& .MuiStepper-alternativeLabel': {
      '& .MuiStepConnector-root': {
        top: stepperTokens.connector.alternativeLabelTop,
      },
      '& .MuiStepLabel-labelContainer': {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& > * + *': {
          marginTop: theme.spacing(1),
        },
      },
    },
    '& .MuiStepper-vertical': {
      '& .MuiStep-root': {
        '& .step-label': {
          justifyContent: 'flex-start',
        },
        '& .MuiStepContent-root': {
          borderInlineStartWidth: stepperTokens.vertical.stepContentBorderInlineStartWidth,
          marginLeft: theme.spacing(stepperTokens.vertical.stepContentMarginLeftSpacing),
          borderColor: theme.palette.primary.main,
        },
        '& .button-wrapper': {
          marginTop: theme.spacing(stepperTokens.vertical.buttonWrapperMarginTopSpacing),
        },
        '&.active + .MuiStepConnector-root .MuiStepConnector-line': {
          borderColor: theme.palette.primary.main,
        },
      },
      '& .MuiStepConnector-root': {
        marginLeft: theme.spacing(stepperTokens.vertical.stepContentMarginLeftSpacing),
        '& .MuiStepConnector-line': {
          borderBlockStartWidth: 0,
          borderInlineStartWidth: stepperTokens.vertical.stepContentBorderInlineStartWidth,
          borderRadius: 0,
        },
      },
    },
  }
})

export default StepperWrapper
