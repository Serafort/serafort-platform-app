import type { ChildrenType, SystemMode } from '@cap/shared-types'
import { Box } from '@mui/material'
import { AdaptiveLogo } from '@cap/theme'
import { useSettings } from '@cap/platform-store'
import { blankLayoutClasses } from '../utils/layoutClasses'
import AmbientBackdrop, { type AmbientBackdropIntensity } from '../components/AmbientBackdrop'
import classnames from 'classnames'

export type BlankBackdropIntensity = AmbientBackdropIntensity | 'none'

type Props = ChildrenType & {
  systemMode?: SystemMode
  /**
   * Centre a single card in the viewport (min-height 100dvh, responsive
   * gutter). Off by default — a bare `BlankLayout` stays a full-bleed
   * passthrough for screens that lay themselves out.
   */
  centered?: boolean
  /** `center` for a short card; `top` for a workspace that can outgrow the viewport. */
  align?: 'center' | 'top'
  /** Ambient gradient wash behind the centred content. Ignored unless `centered`. */
  backdrop?: BlankBackdropIntensity
  /** Serafort mark above the centred card. Ignored unless `centered`. */
  logo?: boolean
  /** Max inline size of the centred content column. */
  maxWidth?: number | string
}

const BlankLayout = ({
  children,
  centered = false,
  align = 'center',
  backdrop = 'none',
  logo = false,
  maxWidth = 480,
}: Props) => {
  const { settings } = useSettings()

  if (!centered) {
    return (
      <div
        className={classnames(blankLayoutClasses.root, 'is-full bs-full')}
        data-skin={settings.skin}
      >
        {children}
      </div>
    )
  }

  return (
    <Box
      className={classnames(blankLayoutClasses.root)}
      data-skin={settings.skin}
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        p: { xs: 2, sm: 3, md: 4 },
        ...(align === 'top' ? { pt: { xs: 3, sm: 5, md: 6 } } : {}),
        boxSizing: 'border-box',
        position: 'relative',
        bgcolor: 'transparent',
      }}
    >
      {backdrop !== 'none' && <AmbientBackdrop intensity={backdrop} />}

      {logo && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            maxWidth,
            mx: 'auto',
            mb: { xs: 3, sm: 4 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <AdaptiveLogo height={40} />
        </Box>
      )}

      <Box
        sx={{
          width: '100%',
          maxWidth,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default BlankLayout
