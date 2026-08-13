
import { Box, Typography, Card, CardContent, Button, Stepper, Step, StepLabel, StepContent, Container, Paper, Divider, Stack } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Info from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';

const EmailChangeStatusDashboard = () => {
  const { t } = useTranslation()

  const steps = [
    {
      label: 'Verify Old Email',
      description: 'Code sent to j***@gmail.com',
      completed: true,
    },
    {
      label: 'Confirm New Email',
      description:
        "We've sent a confirmation link to j***@work.com. Please click the link inside to finalize this change.",
      completed: false,
    },
  ]

  const timer = {
    hours: '00',
    minutes: '14',
    seconds: '32',
  }

  return (
    <Container maxWidth='md' sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant='h4' fontWeight='bold' gutterBottom>
          {t('auth.account.email_change_request', 'Email Change Request')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t(
            'auth.account.email_change_request_desc',
            "You've requested to change your email address. Please follow the steps below to verify ownership and complete the process.",
          )}
        </Typography>
      </Box>

      <Card variant='outlined' sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            <Stepper orientation='vertical' nonLinear activeStep={1}>
              {steps.map((step, index) => (
                <Step key={step.label} expanded active={index === 1}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: index <= 1 ? 'primary.main' : 'action.disabledBackground',
                          color: 'white',
                        }}
                      >
                        {step.completed ? (
                          <CheckCircle sx={{ fontSize: 20 }} />
                        ) : (
                          <Typography variant='caption' fontWeight='bold'>
                            {index + 1}
                          </Typography>
                        )}
                      </Box>
                    )}
                  >
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {index === 1 && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant='outlined'
                          size='small'
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Resend confirmation link
                        </Button>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider />

          <Box sx={{ p: 4, bgcolor: 'action.hover' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                textTransform='uppercase'
                letterSpacing={1}
                gutterBottom
              >
                Security link expires in
              </Typography>
              <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 2 }}>
                {[
                  { value: timer.hours, label: 'Hours' },
                  { value: timer.minutes, label: 'Minutes' },
                  { value: timer.seconds, label: 'Seconds' },
                ].map((unit, i) => (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Paper
                      variant='outlined'
                      sx={{
                        width: 64,
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant='h4' fontWeight='bold' color='primary'>
                        {unit.value}
                      </Typography>
                    </Paper>
                    <Typography variant='caption' color='text.secondary' fontWeight='bold'>
                      {unit.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: 'info.lighter',
          border: '1px solid',
          borderColor: 'info.light',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <Info color='info' sx={{ mr: 2, mt: 0.5 }} />
        <Box>
          <Typography variant='subtitle2' fontWeight='bold' color='info.main'>
            Need help?
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            If you didn&apos;t initiate this request or no longer want to change your email, you can
            securely cancel this process.
          </Typography>
          <Button
            variant='text'
            size='small'
            color='error'
            sx={{ textTransform: 'none', fontWeight: 'bold', mt: 1, p: 0 }}
          >
            Cancel Request
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default EmailChangeStatusDashboard
