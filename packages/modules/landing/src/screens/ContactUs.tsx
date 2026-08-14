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
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { themeConfig } from '@cap/platform-core'
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import HelpOutline from '@mui/icons-material/HelpOutline';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Twitter from '@mui/icons-material/Twitter';

const ContactUs = () => {
  return (
    <>
      <title>Contact Us - {themeConfig.templateName}</title>
      <meta
        name='description'
        content={`Contact us for support or inquiries at ${themeConfig.templateName}`}
      />

      <Container maxWidth='lg' sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant='h2' component='h1' gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant='h6' color='text.secondary'>
            Have a question or need support? Fill out the form below and our team will get back to
            you.
          </Typography>
        </Box>

        <Grid container spacing={8}>
          {/* Left Side: Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant='h4' component='h2' gutterBottom>
              Send us a Message
            </Typography>
            <Box component='form' noValidate autoComplete='off'>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField required fullWidth id='full-name' label='Full Name' name='fullName' />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    id='email'
                    label='Email Address'
                    name='email'
                    type='email'
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField required fullWidth id='subject' label='Subject' name='subject' />
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
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    size='large'
                    sx={{ py: 2, px: 4 }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right Side: Other Ways to Reach Us */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant='h4' component='h2' gutterBottom>
              Other Ways to Reach Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card variant='outlined'>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailOutlined color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6'>Support Email</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      For technical issues and help.
                    </Typography>
                    <Link href='mailto:support@jobtrackr.com' color='primary'>
                      support@jobtrackr.com
                    </Link>
                  </Box>
                </CardContent>
              </Card>

              <Card variant='outlined'>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleOutline color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6'>Social Media</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Follow us for updates and news.
                    </Typography>
                    <Box>
                      <IconButton color='primary'>
                        <LinkedIn />
                      </IconButton>
                      <IconButton color='primary'>
                        <Twitter />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card variant='outlined'>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HelpOutline color='primary' sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant='h6'>Help Center</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Find answers to common questions.
                    </Typography>
                    <Link href='#' color='primary'>
                      Visit our FAQ page
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default ContactUs
