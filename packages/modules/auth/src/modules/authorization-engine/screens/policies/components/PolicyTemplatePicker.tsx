import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  alpha,
  useTheme,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { POLICY_CANVAS_TEMPLATES, type VisualPolicyGraph } from '@cap/authorization'

interface PolicyTemplatePickerProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: VisualPolicyGraph) => void
}

export const PolicyTemplatePicker: React.FC<PolicyTemplatePickerProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const theme = useTheme()

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color='primary' />
        <Typography variant='h6' sx={{ fontWeight: 800 }}>
          Select Pre-Built Enterprise Policy Template
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Choose a battle-tested template to populate your visual canvas. You can customize, connect extra conditions, or simulate immediately.
        </Typography>

        <Grid container spacing={2.5}>
          {POLICY_CANVAS_TEMPLATES.map((template) => (
            <Grid size={{ xs: 12, md: 6 }} key={template.id}>
              <Card

                variant='outlined'
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    onSelectTemplate(template)
                    onClose()
                  }}
                  sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                      {template.name}
                    </Typography>
                    <Chip
                      icon={<AccountTreeIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${template.nodes.length} Nodes`}
                      size='small'
                      color='primary'
                      variant='outlined'
                      sx={{ fontWeight: 700, fontSize: 11 }}
                    />
                  </Box>

                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2, flex: 1 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, width: '100%' }}>
                    <Chip
                      label={`Default: ${template.defaultEffect.toUpperCase()}`}
                      size='small'
                      sx={{ fontSize: 10, fontWeight: 700 }}
                    />
                    <Chip
                      label={`Algorithm: ${template.combiningAlgorithm}`}
                      size='small'
                      sx={{ fontSize: 10, fontWeight: 700 }}
                    />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
