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
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color='primary' />
        <Typography variant='h6' sx={{ fontWeight: 800 }}>
          {t('auth.admin.policy.template_title', 'Choose a policy template')}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {t(
            'auth.admin.policy.template_help',
            'A template populates the canvas with a working policy you can then edit, extend or simulate.',
          )}
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
                  sx={{
                    p: 2.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                      {template.name}
                    </Typography>
                    <Chip
                      icon={<AccountTreeIcon sx={{ fontSize: '14px !important' }} />}
                      label={t('auth.admin.policy.node_count', {
                        count: template.nodes.length,
                        defaultValue: '{{count}} nodes',
                      })}
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
                      label={t('auth.admin.policy.default_effect', {
                        effect: template.defaultEffect,
                        defaultValue: 'Default: {{effect}}',
                      })}
                      size='small'
                      sx={{ fontSize: 10, fontWeight: 700 }}
                    />
                    <Chip
                      label={t('auth.admin.policy.algorithm', {
                        algorithm: template.combiningAlgorithm,
                        defaultValue: 'Algorithm: {{algorithm}}',
                      })}
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
        <Button onClick={onClose} sx={{ minHeight: 44, fontWeight: 700 }}>
          {t('auth.common.cancel', 'Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
