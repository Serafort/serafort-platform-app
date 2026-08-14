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

const PrivacyPolicy = () => {
  return (
    <>
      <title>Privacy Policy - {themeConfig.templateName}</title>
      <meta name='description' content={`Privacy Policy for ${themeConfig.templateName}`} />

      <Container maxWidth='md' sx={{ py: 8 }}>
        <Typography variant='h2' component='h1' gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Last Updated: October 26, 2023
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant='h5' component='h2' gutterBottom>
            Introduction
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Welcome to the Job Application Tracker. We are committed to protecting your privacy and
            handling your data in an open and transparent manner. This privacy policy sets out how
            we collect, use, and safeguard your information when you use our web application.
          </Typography>
        </Box>

        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>1. Information We Collect</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                We collect information to provide and improve our service. The types of information
                we collect include:
              </Typography>
              <ul>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>Personal Identification Information:</strong> Name, email address, and
                    contact details that you provide upon registration.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>Professional Information:</strong> Resumes, cover letters, work history,
                    skills, and other career-related documents you upload.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>Usage Data:</strong> We automatically collect information on how the
                    service is accessed and used. This may include your computer's IP address,
                    browser type, pages visited, and timestamps.
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>2. How We Use Your Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                Your information is used for the following purposes:
              </Typography>
              <ul>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    To provide the core functionality of our service, including automating job
                    applications and tracking their status.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    To personalize your experience and tailor content.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    To communicate with you about your account or our services.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    To analyze usage patterns to monitor and improve our application.
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>3. Data Sharing and Disclosure</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary' gutterBottom>
                We do not sell your personal data. We may share your information under the following
                circumstances:
              </Typography>
              <ul>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>With Prospective Employers:</strong> Your professional information is
                    shared when we submit an application on your behalf.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>With Third-Party Service Providers:</strong> We may employ third-party
                    companies to facilitate our service, who are obligated not to disclose or use
                    your information for any other purpose.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' color='text.secondary'>
                    <strong>For Legal Requirements:</strong> We may disclose your information if
                    required to do so by law or in response to valid requests by public authorities.
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>4. Data Security</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                The security of your data is important to us. We use commercially acceptable means
                to protect your Personal Information, including encryption and secure server
                infrastructure. However, remember that no method of transmission over the Internet
                is 100% secure.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>5. Your Rights</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                You have the right to access, update, or delete the information we have on you. You
                can do this at any time through your account settings or by contacting our support
                team.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>6. Cookie Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                We use cookies and similar tracking technologies to track activity on our service
                and hold certain information. Cookies are files with a small amount of data. You can
                instruct your browser to refuse all cookies or to indicate when a cookie is being
                sent.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>7. Changes to This Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the "Last
                Updated" date. You are advised to review this Privacy Policy periodically for any
                changes.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>8. Contact Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant='body1' color='text.secondary'>
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <Link href='mailto:privacy@jobtracker.com'>privacy@jobtracker.com</Link>.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Container>
    </>
  )
}

export default PrivacyPolicy
