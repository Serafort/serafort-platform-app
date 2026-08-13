import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { themeConfig } from '@cap/platform-core'

const TermsOfService = () => {
  return (
    <>
      <title>Terms of Service - {themeConfig.templateName}</title>
      <meta name='description' content={`Terms of Service for ${themeConfig.templateName}`} />

      <Container maxWidth='md' sx={{ py: 8 }}>
        <Typography variant='h2' component='h1' gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Last Updated: October 26, 2023
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant='h5' component='h2' gutterBottom>
            Introduction
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Welcome to the Job Application Tracker. These Terms of Service govern your use of our
            web application. By accessing or using our service, you agree to be bound by these
            terms.
          </Typography>
        </Box>

        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>1. User Accounts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                To use our service, you must create an account. You are responsible for maintaining
                the confidentiality of your account and password.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>2. User Conduct</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                You agree not to use the service for any unlawful purpose or to engage in any
                conduct that could damage, disable, or impair the service.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>3. Intellectual Property</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                The service and its original content, features, and functionality are and will
                remain the exclusive property of Job Application Tracker and its licensors.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>4. Termination</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                We may terminate or suspend your account immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach the
                Terms.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>5. Limitation of Liability</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                In no event shall Job Application Tracker, nor its directors, employees, partners,
                agents, suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential or punitive damages.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>6. Governing Law</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                These Terms shall be governed and construed in accordance with the laws of the
                jurisdiction, without regard to its conflict of law provisions.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>7. Changes to These Terms</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. We will provide notice of any changes by posting the new Terms of Service
                on this page.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>8. Contact Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                If you have any questions about these Terms, please contact us at:{' '}
                <Link href='mailto:terms@jobtracker.com'>terms@jobtracker.com</Link>.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Container>
    </>
  )
}

export default TermsOfService
