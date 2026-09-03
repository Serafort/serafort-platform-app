import React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Rating,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface Testimonial {
  rating: number
  text: string
  name: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    rating: 5,
    text: 'This platform transformed my job search. The AI-powered recommendations were incredibly accurate and saved me hours of scrolling.',
    name: 'Alex Johnson',
    role: 'Software Engineer at TechCorp',
  },
  {
    rating: 5,
    text: "The platform's interface is clean and intuitive. I found my dream job in just two weeks, something I couldn't achieve on other sites.",
    name: 'Maria Garcia',
    role: 'UX Designer at Innovate Co.',
  },
  {
    rating: 5,
    text: "As a recruiter, this is the future. The quality of candidates we've found through this platform is unmatched. A game-changer.",
    name: 'David Chen',
    role: 'Head of Talent at FutureForward Inc.',
  },
]

const Testimonials: React.FC = () => {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth='lg'>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, sm: 8 } }}>
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Trusted by Top Professionals
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary',
              lineHeight: 1.7,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Discover why industry leaders and aspiring professionals alike choose our platform to
            advance their careers.
          </Typography>
        </Box>

        {/* Testimonials Slider */}
        <Box sx={{ position: 'relative' }}>
          {/* Navigation Buttons - Desktop */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              justifyContent: 'space-between',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <IconButton
              onClick={handlePrev}
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                pointerEvents: 'auto',
                transform: 'translateX(-50%)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                pointerEvents: 'auto',
                transform: 'translateX(50%)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          {/* Cards Container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: { xs: 2, lg: 8 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                overflow: { xs: 'auto', lg: 'visible' },
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                width: '100%',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {testimonials.map((testimonial, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    minWidth: { xs: 280, sm: 340 },
                    maxWidth: { xs: 340, lg: 340 },
                    p: { xs: 3, sm: 4 },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    scrollSnapAlign: 'center',
                    transition: 'all 0.3s ease',
                    opacity: { xs: 1, lg: index === currentIndex ? 1 : 0.5 },
                    transform: {
                      xs: 'scale(1)',
                      lg: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                    },
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  {/* Rating */}
                  <Rating value={testimonial.rating} readOnly size='small' />

                  {/* Testimonial Text */}
                  <Typography
                    variant='body1'
                    sx={{
                      color: 'text.primary',
                      lineHeight: 1.7,
                      flexGrow: 1,
                    }}
                  >
                    &quot;{testimonial.text}&quot;
                  </Typography>

                  {/* Author Info */}
                  <Box>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Dots Indicator */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              pt: { xs: 4, sm: 6 },
            }}
          >
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    index === currentIndex
                      ? 'primary.main'
                      : alpha(theme.palette.text.primary, 0.3),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor:
                      index === currentIndex
                        ? 'primary.main'
                        : alpha(theme.palette.text.primary, 0.5),
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Testimonials
