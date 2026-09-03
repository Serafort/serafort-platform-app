import React, { useEffect, useRef } from 'react'
import { Alert, Box, Container, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { WidgetCanvas, CustomModeFab } from '@cap/theme'
import { useLayoutEngineContext } from '@cap/platform-core'
import { useAppStore } from '@cap/platform-store'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import { GuestBanner } from '@cap/layout'
import { useGuest } from '@cap/platform-core'
import {
  HeroBannerWidget,
  FeaturesWidget,
  AboutWidget,
  StatsWidget,
  CtaWidget,
  DEFAULT_LANDING_GRID_LAYOUT,
} from '../widgets'

export default function Home() {
  const navigate = useNavigate()
  const { isGuest } = useGuest()
  const { t } = useTranslation()
  const { isCustomMode, toggleCustomMode } = useLayoutEngineContext()
  const initializeLayout = useAppStore((state) => state.initializeLayout)
  const PAGE_ID = 'landing'

  useEffect(() => {
    initializeLayout(PAGE_ID, DEFAULT_LANDING_GRID_LAYOUT)
  }, [initializeLayout])

  return (<>
    <WidgetCanvas pageId={PAGE_ID} mode={isCustomMode ? 'custom' : 'classic'} defaultLayout={DEFAULT_LANDING_GRID_LAYOUT} />

    <CustomModeFab customMode={isCustomMode} onToggle={toggleCustomMode} />
  </>)


  // return (
  //   <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
  //     <Container maxWidth='lg' sx={{ py: 4 }}>
  //       {/* Guest Mode Banner */}
  //       {/* {isGuest && (
  //         <Box sx={{ mb: 3 }}>
  //           <GuestBanner
  //             variant='minimal'
  //             message='Create a free account to unlock all features and save your job searches!'
  //             isGuest={isGuest}
  //             onSignIn={() => navigate('/auth/sign-in')}
  //             onSignUp={() => navigate('/auth/register')}
  //           />
  //         </Box>
  //       )} */}

  //       {/* Hero Banner Widget */}
  //       {/* <HeroBannerWidget /> */}

  //       {/* Features Grid Widget */}
  //       {/* <FeaturesWidget /> */}

  //       {/* About & Stats Widgets Section */}
  //       {/* <Grid container spacing={5} sx={{ mb: 10 }}>
  //         <Grid size={{ xs: 12, md: 7 }}>
  //           <AboutWidget />
  //         </Grid>
  //         <Grid size={{ xs: 12, md: 5 }}>
  //           <StatsWidget />
  //         </Grid>
  //       </Grid> */}

  //       {/* Call to Action Widget */}
  //       {/* <CtaWidget /> */}

  //     </Container>
  //     <WidgetCanvas pageId={PAGE_ID} mode={isCustomMode ? 'custom' : 'classic'} defaultLayout={DEFAULT_LANDING_GRID_LAYOUT} />

  //     <CustomModeFab customMode={isCustomMode} onToggle={toggleCustomMode} />
  //   </Box>
  // )
}
