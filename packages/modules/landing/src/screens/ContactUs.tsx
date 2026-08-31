import React, { useState } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Link,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { themeConfig } from '@cap/platform-core'
import EmailOutlined from '@mui/icons-material/EmailOutlined'
import PeopleOutline from '@mui/icons-material/PeopleOutline'
import HelpOutline from '@mui/icons-material/HelpOutline'
import LinkedIn from '@mui/icons-material/LinkedIn'
import Twitter from '@mui/icons-material/Twitter'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SendIcon from '@mui/icons-material/Send'
import { contactService } from '@cap/auth-contracts'

const ContactUs: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      const response = await contactService.submitContactMessage({
        fullName: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      })

      if (response?.data?.success) {
        setIsSuccess(true)
      } else {
        setError('Failed to submit message. Please try again.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFullName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setIsSuccess(false)
    setError(null)
  }

  return (
    <>
      <title>Contact Us - {themeConfig.templateName}</title>
      <meta
        name='description'
        content={`Contact us for support or inquiries at ${themeConfig.templateName}`}
      />

      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant='h2' component='h1' fontWeight={700} gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant='h6' color='text.secondary' sx={{ maxWidth: 650, mx: 'auto' }}>
            Have a question, custom enterprise inquiry, or need technical support? Fill out the form
            below and our team will get back to you promptly.
          </Typography>
        </Box>

        <Grid container spacing={8}>
          {/* Left Side: Contact Form / Confirmation */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant='h4' component='h2' fontWeight={600} gutterBottom>
              Send us a Message
            </Typography>

            {isSuccess ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'success.light',
                  bgcolor: 'action.hover',
                  textAlign: 'center',
                }}
              >
                <CheckCircleOutlineIcon color='success' sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant='h5' fontWeight={700} gutterBottom>
                  Thank You for Reaching Out!
                </Typography>
                <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
                  Your inquiry has been received. Our solutions engineering team will review your
                  message and respond to <strong>{email}</strong> within 1 business day.
                </Typography>
                <Button variant='outlined' onClick={handleReset}>
                  Send Another Message
                </Button>
              </Paper>
            ) : (
              <Box component='form' onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      id='full-name'
                      label='Full Name'
                      name='fullName'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder='e.g. Alex Morgan'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      id='email'
                      label='Email Address'
                      name='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='e.g. alex@company.com'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      id='subject'
                      label='Subject'
                      name='subject'
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder='e.g. Enterprise SSO Inquiry / Dedicated Instance'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      id='message'
                      label='Message'
                      name='message'
                      multiline
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder='Tell us about your team and requirements...'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type='submit'
                      variant='contained'
                      color='primary'
                      size='large'
                      startIcon={
                        isLoading ? <CircularProgress size={20} color='inherit' /> : <SendIcon />
                      }
                      disabled={isLoading}
                      sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                    >
                      {isLoading ? 'Sending Inquiry...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right Side: Other Ways to Reach Us */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant='h4' component='h2' fontWeight={600} gutterBottom>
              Other Ways to Reach Us
            </Typography>
            <Stack spacing={3}>
              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailOutlined color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      Support & Enterprise Sales
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      For technical support and inquiries.
                    </Typography>
                    <Link href='mailto:support@mascayiti.com' color='primary' fontWeight={500}>
                      support@mascayiti.com
                    </Link>
                  </Box>
                </CardContent>
              </Card>

              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleOutline color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      Community & Socials
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Follow our engineering updates.
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <IconButton color='primary' size='small'>
                        <LinkedIn />
                      </IconButton>
                      <IconButton color='primary' size='small'>
                        <Twitter />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HelpOutline color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      Developer Documentation
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      SDK references, API endpoints, and guides.
                    </Typography>
                    <Link href='/developer/docs' color='primary' fontWeight={500}>
                      Browse API Reference & Guides
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default ContactUs
