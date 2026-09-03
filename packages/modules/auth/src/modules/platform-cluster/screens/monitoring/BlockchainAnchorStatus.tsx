import { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import AccountTree from '@mui/icons-material/AccountTree'
import OpenInNew from '@mui/icons-material/OpenInNew'
import GppMaybe from '@mui/icons-material/GppMaybe'
import { useTranslation } from 'react-i18next'
import { useBlockchainAnchorsQuery } from '../../hooks/useAuditChainQuery'
import { isPlatformScopeError } from '../../services/audit-chain.service'
import {
  anchorExplorerUrl,
  type BlockchainAnchorState as AnchorState,
  type BlockchainAnchorType,
} from '../../types/auditChain.types'

/**
 * Blockchain Anchor Status & Explorer.
 *
 * Reads the `blockchain_transactions` ledger written by `BlockchainAnchorJob`
 * and links each transaction to a block explorer.
 *
 * The explorer base URL comes from the backend's network descriptor rather than
 * a constant here: a testnet deployment must not link to mainnet Polygonscan
 * for a transaction that only exists on Amoy. The same descriptor is what lets
 * this screen distinguish "anchoring is switched off" from "nothing has been
 * anchored yet" — an empty table means something different in each case, and
 * showing the wrong one sends an operator looking for a fault that is a
 * configuration choice.
 */

const STATE_COLOR: Record<AnchorState, 'success' | 'warning' | 'error'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
}

const ANCHOR_TYPES: BlockchainAnchorType[] = [
  'DID_ANCHOR',
  'VC_ANCHOR',
  'CONSENT_ANCHOR',
  'DOC_ANCHOR',
]

export const BlockchainAnchorStatus: React.FC = () => {
  const { t } = useTranslation()
  const [state, setState] = useState<AnchorState | ''>('')
  const [type, setType] = useState<BlockchainAnchorType | ''>('')

  const { data, isLoading, error } = useBlockchainAnchorsQuery({
    page: 1,
    limit: 50,
    status: state || undefined,
    type: type || undefined,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && isPlatformScopeError(error)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='info' icon={<GppMaybe />}>
          <AlertTitle>
            {t('monitoring.anchors.scope_title', 'Platform administrators only')}
          </AlertTitle>
          {t(
            'monitoring.anchors.scope_body',
            'The anchor ledger records commitments for the platform as a whole and has no per-organization view.',
          )}
        </Alert>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          {t('monitoring.anchors.error', 'The blockchain anchor ledger could not be read.')}
        </Alert>
      </Container>
    )
  }

  const network = data?.network
  const anchors = data?.data ?? []
  const lastConfirmed = anchors.find((anchor) => anchor.status === 'CONFIRMED') ?? null

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <AccountTree color='primary' />
        <Typography variant='h4'>
          {t('monitoring.anchors.title', 'Blockchain anchors')}
        </Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'monitoring.anchors.subtitle',
          'Commitments published on-chain, so a record’s existence at a point in time can be proven without trusting this system.',
        )}
      </Typography>

      {network && !network.anchoringEnabled && (
        <Alert severity='info' sx={{ mb: 3 }}>
          <AlertTitle>{t('monitoring.anchors.disabled_title', 'Anchoring is off')}</AlertTitle>
          {t(
            'monitoring.anchors.disabled_body',
            'BLOCKCHAIN_ANCHORING_ENABLED is not set, so the anchoring worker does not run. Hashes are still recorded in the database; nothing is published on-chain. An empty ledger below is expected.',
          )}
        </Alert>
      )}

      {network && network.anchoringEnabled && !network.rpcConfigured && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <AlertTitle>{t('monitoring.anchors.no_rpc_title', 'No RPC endpoint')}</AlertTitle>
          {t(
            'monitoring.anchors.no_rpc_body',
            'Anchoring is enabled but POLYGON_RPC_URL is unset, so transaction hashes are generated locally and are not on any chain. Explorer links will not resolve.',
          )}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='overline' color='text.secondary'>
                {t('monitoring.anchors.network', 'Network')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Detail
                  label={t('monitoring.anchors.chain', 'Chain')}
                  value={network?.name ?? '—'}
                />
                <Detail
                  label={t('monitoring.anchors.explorer', 'Explorer')}
                  value={network?.explorerBaseUrl ?? '—'}
                />
                <Detail
                  label={t('monitoring.anchors.contract', 'Anchor contract')}
                  value={network?.anchorContract ?? t('monitoring.anchors.none', 'Not set')}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='overline' color='text.secondary'>
                {t('monitoring.anchors.last_confirmed', 'Last confirmed anchor')}
              </Typography>
              {lastConfirmed && network ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Detail
                    label={t('monitoring.anchors.tx', 'Transaction')}
                    value={`${lastConfirmed.txHash.slice(0, 18)}…`}
                    title={lastConfirmed.txHash}
                  />
                  <Detail
                    label={t('monitoring.anchors.type', 'Type')}
                    value={lastConfirmed.type}
                  />
                  <Detail
                    label={t('monitoring.anchors.at', 'Committed')}
                    value={new Date(lastConfirmed.createdAt).toLocaleString()}
                  />
                  <Link
                    href={anchorExplorerUrl(network, lastConfirmed.txHash)}
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {t('monitoring.anchors.view_explorer', 'View on explorer')}
                    <OpenInNew fontSize='inherit' />
                  </Link>
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {t('monitoring.anchors.none_confirmed', 'No confirmed anchor yet.')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant='outlined'>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='space-between'
            alignItems={{ sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Typography variant='h6'>
              {t('monitoring.anchors.ledger', 'Anchor ledger')}
            </Typography>
            <Stack direction='row' spacing={1}>
              <Select
                size='small'
                displayEmpty
                value={state}
                onChange={(event) => setState(event.target.value as AnchorState | '')}
                inputProps={{ 'aria-label': t('monitoring.anchors.filter_status', 'Status') }}
              >
                <MenuItem value=''>{t('monitoring.anchors.all_statuses', 'All statuses')}</MenuItem>
                {(Object.keys(STATE_COLOR) as AnchorState[]).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
              <Select
                size='small'
                displayEmpty
                value={type}
                onChange={(event) => setType(event.target.value as BlockchainAnchorType | '')}
                inputProps={{ 'aria-label': t('monitoring.anchors.filter_type', 'Type') }}
              >
                <MenuItem value=''>{t('monitoring.anchors.all_types', 'All types')}</MenuItem>
                {ANCHOR_TYPES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>

          {anchors.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {network?.anchoringEnabled
                ? t('monitoring.anchors.empty_enabled', 'Nothing has been anchored yet.')
                : t(
                    'monitoring.anchors.empty_disabled',
                    'No anchors, because anchoring is switched off.',
                  )}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('monitoring.anchors.at', 'Committed')}</TableCell>
                    <TableCell>{t('monitoring.anchors.type', 'Type')}</TableCell>
                    <TableCell>{t('monitoring.anchors.status', 'Status')}</TableCell>
                    <TableCell>{t('monitoring.anchors.tx', 'Transaction')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anchors.map((anchor) => (
                    <TableRow key={anchor.id}>
                      <TableCell>{new Date(anchor.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{anchor.type}</TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          color={STATE_COLOR[anchor.status]}
                          label={anchor.status}
                        />
                      </TableCell>
                      <TableCell>
                        {network ? (
                          <Link
                            href={anchorExplorerUrl(network, anchor.txHash)}
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {anchor.txHash.slice(0, 18)}…
                          </Link>
                        ) : (
                          <Box component='span' sx={{ fontFamily: 'monospace' }}>
                            {anchor.txHash.slice(0, 18)}…
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

const Detail: React.FC<{ label: string; value: string; title?: string }> = ({
  label,
  value,
  title,
}) => (
  <Stack direction='row' justifyContent='space-between' spacing={2}>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <Tooltip title={title ?? ''}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Tooltip>
  </Stack>
)

export default BlockchainAnchorStatus
