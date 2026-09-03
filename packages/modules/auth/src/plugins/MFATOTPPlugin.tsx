import { IAuthPlugin } from '@cap/platform-core'
import { Button } from '@mui/material'
import PhonelinkLock from '@mui/icons-material/PhonelinkLock'

/**
 * MFA TOTP Plugin (Demonstration of Module Magnetism)
 */
export const MFATOTPPlugin: IAuthPlugin = {
  id: 'mfa-totp',
  name: 'auth.mfa.totp.title',
  type: 'secondary',

  ui: {
    loginOption: ({ onClick, disabled }) => (
      <Button
        fullWidth
        variant='outlined'
        startIcon={<PhonelinkLock />}
        onClick={onClick}
        disabled={disabled}
        sx={{
          py: 1.2,
          borderRadius: 3,
          fontWeight: 700,
          textTransform: 'none',
          color: 'text.primary',
          bgcolor: 'background.paper',
        }}
      >
        MFA Code (Authenticator)
      </Button>
    ),

    verificationView: ({ challenge, onVerify, onCancel, isLoading }) => {
      // In a real scenario, this would be a specialized screen component
      return (
        <div>
          {/* MFA Verification UI logic would go here */}
          <p>MFA Challenge: {challenge.type}</p>
          <button onClick={() => onVerify({ code: '123456' })} disabled={isLoading}>
            Verify
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      )
    },
  },

  handleChallenge: async (challengeData) => {
    // Logic to prepare the UI for this specific challenge
    return { ...challengeData, method: 'totp' }
  },
}
