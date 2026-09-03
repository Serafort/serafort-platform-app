import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, InputAdornment, alpha, useTheme, Stack, Chip, IconButton, Divider, Paper, CircularProgress, Alert, Tabs, Tab, Tooltip } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckIcon from '@mui/icons-material/Check';
import PublicIcon from '@mui/icons-material/Public';
import ApiIcon from '@mui/icons-material/Api';
import CodeIcon from '@mui/icons-material/Code';
import LayersIcon from '@mui/icons-material/Layers';

import { useTranslation } from 'react-i18next';
import apiExplorerService, { OpenAPISpec, OpenAPIPathItem } from '../../services/api-explorer.service';

interface APIEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary?: string
  description?: string
  requiredScopes: string[]
  isPublic: boolean
}

function parseOpenAPISpec(spec: OpenAPISpec): APIEndpoint[] {
  const endpoints: APIEndpoint[] = []
  const paths = spec.paths ?? {}
  let idx = 0

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        const op = operation as OpenAPIPathItem
        const scopes: string[] = []
        if (Array.isArray(op.security)) {
          for (const sec of op.security) {
            for (const scopeList of Object.values(sec) as string[][]) {
              scopes.push(...scopeList)
            }
          }
        }
        endpoints.push({
          id: `ep_${idx++}`,
          path,
          method: method.toUpperCase() as APIEndpoint['method'],
          summary: op.summary ?? `${method.toUpperCase()} ${path}`,
          description: op.description,
          requiredScopes: scopes,
          isPublic: scopes.length === 0,
        })
      }
    }
  }

  return endpoints
}

const METHOD_PALETTE: Record<string, string> = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'error',
  PATCH: 'info',
}

function MethodBadge({ method, size = 'medium' }: { method: string; size?: 'small' | 'medium' }) {
  const theme = useTheme()
  const colorKey = METHOD_PALETTE[method] ?? 'default'
  const color = (theme.palette as any)[colorKey]?.main ?? theme.palette.text.secondary

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: size === 'small' ? 0.75 : 1.25,
        py: size === 'small' ? 0.25 : 0.5,
        borderRadius: 1,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.25)}`,
        minWidth: size === 'small' ? 44 : 60,
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
          letterSpacing: '0.04em',
          color,
          lineHeight: 1,
        }}
      >
        {method}
      </Typography>
    </Box>
  )
}

function getGroupKey(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts.length > 1 ? `/${parts.slice(0, 2).join('/')}` : `/${parts[0] ?? 'root'}`
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function generateCurlSnippet(ep: APIEndpoint): string {
  return `curl -X ${ep.method} "https://api.trustkey.com${ep.path}" \\\n  -H "Authorization: Bearer <TOKEN>"`
}

function generateJsSnippet(ep: APIEndpoint): string {
  const isRead = ep.method === 'GET'
  const method = ep.method.toLowerCase()
  return `import { apiClient } from '@cap/platform-core';

apiClient.${method}("${ep.path}"${isRead ? '' : ', { /* data */ }'})
  .then(response => {
    console.log(response.data);
  });`
}

function generatePythonSnippet(ep: APIEndpoint): string {
  const isRead = ep.method === 'GET'
  return `import requests

url = "https://api.trustkey.com${ep.path}"
headers = {
    "Authorization": "Bearer <TOKEN>",
    "Content-Type": "application/json"
}

response = requests.${ep.method.toLowerCase()}(
    url, 
    headers=headers${isRead ? '' : ',\n    json={}'}
)
print(response.json())`
}

function parseRequestBodyJson(requestBody: string): { data: Record<string, unknown>; error?: string } {
  if (!requestBody.trim()) {
    return { data: {} }
  }
  try {
    const data = JSON.parse(requestBody)
    return { data }
  } catch {
    return { data: {}, error: 'Invalid JSON request body' }
  }
}

interface SandboxResponseState {
  status: number
  data: any
}

async function executeSandboxCall(
  endpoint: APIEndpoint,
  parsedData: Record<string, unknown>,
): Promise<SandboxResponseState> {
  try {
    const response = await apiExplorerService.executeSandbox({
      path: endpoint.path,
      method: endpoint.method,
      data: parsedData,
    })
    return {
      status: response.data?.status || 200,
      data: response.data?.data || response.data,
    }
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      data: err.response?.data || { error: 'Execution failed', message: err.message },
    }
  }
}

export default function APIExplorerDashboard() {
  const theme = useTheme()
  const { t } = useTranslation('common')
  const [searchTerm, setSearchTerm] = useState('')
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [sandboxLoading, setSandboxLoading] = useState(false)
  const [sandboxResponse, setSandboxResponse] = useState<SandboxResponseState | null>(null)
  const [requestBody, setRequestBody] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchSpec() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiExplorerService.getSpec()
        if (!cancelled && response.data) {
          const parsed = parseOpenAPISpec(response.data)
          setEndpoints(parsed)
          if (parsed.length > 0) setSelectedEndpoint(parsed[0])
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : t('auth.developer.loadDocsFailed', 'Failed to load API documentation'),
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchSpec()
    return () => {
      cancelled = true
    }
  }, [t])

  const filteredEndpoints = useMemo(() => {
    if (!searchTerm) return endpoints
    const term = searchTerm.toLowerCase()
    return endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(term) ||
        (ep.summary ?? '').toLowerCase().includes(term) ||
        ep.method.toLowerCase().includes(term),
    )
  }, [endpoints, searchTerm])

  /** Group filtered endpoints by first two path segments */
  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, APIEndpoint[]> = {}
    for (const ep of filteredEndpoints) {
      const key = getGroupKey(ep.path)
      if (!groups[key]) groups[key] = []
      groups[key].push(ep)
    }
    return groups
  }, [filteredEndpoints])

  const curlSnippet = useCallback(
    (ep: APIEndpoint) => generateCurlSnippet(ep),
    [],
  )

  const jsSnippet = useCallback(
    (ep: APIEndpoint) => generateJsSnippet(ep),
    [],
  )

  const pythonSnippet = useCallback(
    (ep: APIEndpoint) => generatePythonSnippet(ep),
    [],
  )

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [])

  const handleExecuteSandbox = async () => {
    if (!selectedEndpoint) return

    const { data: parsedData, error: jsonError } = parseRequestBodyJson(requestBody)
    if (jsonError) {
      setError(t('auth.developer.invalidJsonBody', jsonError))
      return
    }

    setSandboxLoading(true)
    setSandboxResponse(null)
    setError(null)

    try {
      const responseState = await executeSandboxCall(selectedEndpoint, parsedData)
      setSandboxResponse(responseState)
    } finally {
      setSandboxLoading(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ApiIcon color='primary' sx={{ fontSize: 28 }} />
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
              }}
            >
              {t('auth.developer.apiExplorer', 'API Explorer')}
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            {t(
              'auth.developer.apiExplorerDesc',
              'Interactive documentation & live sandbox for TrustKey APIs.',
            )}
          </Typography>
        </Box>

        <Stack direction='row' spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant='outlined'
            startIcon={<TerminalIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 2.5 }}
            onClick={() => setDetailTab(3)}
          >
            {t('auth.developer.sdkGuides', 'SDK Guides')}
          </Button>
          <Button
            variant='contained'
            startIcon={<PlayArrowIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              bgcolor: 'info.main',
              color: 'white',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              '&:hover': { bgcolor: 'info.dark' },
            }}
            onClick={() => setDetailTab(2)}
          >
            {t('auth.developer.liveSandbox', 'Live Sandbox')}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !error && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                position: 'sticky',
                top: 16,
                bgcolor: alpha(theme.palette.primary.main, 0.02), // Side card bg refinement
              }}
            >
              {/* Search */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  placeholder={t('auth.developer.searchEndpoints', 'Search endpoints...')}
                  size='small'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  }}
                />
                <Typography
                  variant='caption'
                  color='text.disabled'
                  sx={{ mt: 1, display: 'block', fontWeight: 600 }}
                >
                  {filteredEndpoints.length} {t('auth.developer.endpoints', 'endpoints')}
                </Typography>
              </Box>

              {/* Grouped endpoint list */}
              <Box sx={{ maxHeight: 'calc(100vh - 340px)', overflow: 'auto', p: 1.5 }}>
                {Object.keys(groupedEndpoints).length === 0 && (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <LayersIcon
                      sx={{ fontSize: 32, color: 'text.disabled', mb: 1, opacity: 0.5 }}
                    />
                    <Typography variant='body2' color='text.disabled'>
                      {t('auth.developer.noEndpointsMatch', 'No endpoints match your search.')}
                    </Typography>
                  </Box>
                )}

                {Object.entries(groupedEndpoints).map(([group, eps]) => (
                  <Box key={group} sx={{ mb: 2 }}>
                    {/* Group label */}
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: 'text.disabled',
                        px: 1,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {group}
                    </Typography>

                    <Stack spacing={0.5}>
                      {eps.map((ep) => {
                        const isActive = selectedEndpoint?.id === ep.id
                        return (
                          <Box
                            key={ep.id}
                            onClick={() => {
                              setSelectedEndpoint(ep)
                              setDetailTab(0)
                            }}
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              border: '1px solid',
                              borderColor: isActive
                                ? alpha(theme.palette.primary.main, 0.3)
                                : 'transparent',
                              bgcolor: isActive
                                ? alpha(theme.palette.primary.main, 0.06)
                                : 'transparent',
                              transition: 'all 0.15s',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: alpha(theme.palette.primary.main, 0.15),
                              },
                            }}
                          >
                            <MethodBadge method={ep.method} size='small' />
                            <Typography
                              variant='body2'
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: isActive ? 700 : 500,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.8125rem',
                                color: isActive ? 'text.primary' : 'text.secondary',
                              }}
                            >
                              {ep.path}
                            </Typography>
                          </Box>
                        )
                      })}
                    </Stack>
                  </Box>
                ))}
              </Box>

              {/* Tip box */}
              <Box
                sx={{
                  m: 1.5,
                  mt: 0,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.1),
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 800, color: 'info.main', display: 'block', mb: 0.5 }}
                >
                  {t('auth.developer.sandboxTipHeader', 'SANDBOX TIP')}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5 }}>
                  {t(
                    'auth.developer.sandboxTip',
                    'Use the Live Sandbox button to send authenticated requests against the staging environment.',
                  )}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right: Detail Panel */}
          <Grid size={{ xs: 12, md: 8 }}>
            {selectedEndpoint ? (
              <Card
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Endpoint header */}
                  <Box
                    sx={{
                      p: 3,
                      pb: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1 }}>
                        <MethodBadge method={selectedEndpoint.method} />
                        <Typography
                          variant='h6'
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedEndpoint.path}
                        </Typography>
                      </Stack>
                      <Typography variant='body2' color='text.secondary'>
                        {selectedEndpoint.summary}
                      </Typography>
                      {selectedEndpoint.description && (
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                          {selectedEndpoint.description}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction='row' spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Tooltip title={t('auth.developer.copyPath', 'Copy Path')}>
                        <IconButton
                          size='small'
                          onClick={() => handleCopy(selectedEndpoint.path)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          {copied ? (
                            <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('auth.developer.openInExplorer', 'Open in Explorer')}>
                        <IconButton size='small' sx={{ borderRadius: 1.5 }}>
                          <OpenInNewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Tabs */}
                  <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, mt: 2 }}>
                    <Tabs
                      value={detailTab}
                      onChange={(_, v) => setDetailTab(v)}
                      sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          letterSpacing: '0.05em',
                          minHeight: 40,
                          py: 0,
                        },
                      }}
                    >
                      <Tab
                        label={t('auth.developer.securityTab', 'Security')}
                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                        iconPosition='start'
                      />
                      <Tab
                        label={t('auth.developer.requestTab', 'Request')}
                        icon={<CodeIcon sx={{ fontSize: 14 }} />}
                        iconPosition='start'
                      />
                      <Tab
                        label={t('auth.developer.tryItTab', 'Try It')}
                        icon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                        iconPosition='start'
                      />
                      <Tab
                        label={t('auth.developer.sdkTab', 'SDK')}
                        icon={<TerminalIcon sx={{ fontSize: 14 }} />}
                        iconPosition='start'
                      />
                    </Tabs>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    {/* Tab 0 â€” Security */}
                    <TabPanel value={detailTab} index={0}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1.5,
                        }}
                      >
                        {t('auth.developer.authAndScopes', 'Authentication & Scopes')}
                      </Typography>

                      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                        {selectedEndpoint.isPublic ? (
                          <Chip
                            icon={<PublicIcon sx={{ fontSize: 15 }} />}
                            label={t('auth.developer.publicNoAuth', 'Public â€” No Auth Required')}
                            color='success'
                            size='small'
                            variant='outlined'
                            sx={{ fontWeight: 700, height: 20 }}
                          />
                        ) : (
                          <Chip
                            icon={<LockIcon sx={{ fontSize: 15 }} />}
                            label={t('auth.developer.bearerToken', 'Bearer Token')}
                            size='small'
                            variant='outlined'
                            sx={{
                              fontWeight: 700,
                              height: 20,
                              borderColor: 'divider',
                              color: 'text.primary',
                            }}
                          />
                        )}
                        {selectedEndpoint.requiredScopes.map((scope) => (
                          <Chip
                            key={scope}
                            icon={<SecurityIcon sx={{ fontSize: 15 }} />}
                            label={`${t('auth.developer.scopeLabel', 'Scope')}: ${scope}`}
                            color='info'
                            size='small'
                            variant='outlined'
                            sx={{ fontWeight: 700, height: 20 }}
                          />
                        ))}
                      </Stack>

                      {!selectedEndpoint.isPublic && (
                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.04),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.warning.main, 0.15),
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{
                              fontWeight: 800,
                              color: 'warning.dark',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            {t('auth.developer.authRequiredHeader', 'AUTHORIZATION REQUIRED')}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ lineHeight: 1.6 }}
                          >
                            {t(
                              'auth.developer.authRequiredDesc',
                              'Pass a valid JWT in the Authorization: Bearer <token> header. Tokens can be obtained from POST /auth/token.',
                            )}
                          </Typography>
                        </Box>
                      )}
                    </TabPanel>

                    {/* Tab 1 â€” Request */}
                    <TabPanel value={detailTab} index={1}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1.5,
                        }}
                      >
                        {t('auth.developer.curlPreview', 'cURL Preview')}
                      </Typography>

                      <Paper
                        sx={{
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 3,
                          p: 2.5,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Typography
                          component='pre'
                          variant='body2'
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            m: 0,
                            pr: 5,
                            color: 'text.primary',
                          }}
                        >
                          <Box component='span' sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {selectedEndpoint.method}
                          </Box>
                          {curlSnippet(selectedEndpoint).slice(selectedEndpoint.method.length)}
                        </Typography>

                        <IconButton
                          size='small'
                          sx={{ position: 'absolute', top: 8, right: 8, borderRadius: 1.5 }}
                          onClick={() => handleCopy(curlSnippet(selectedEndpoint))}
                        >
                          {copied ? (
                            <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Paper>

                      <Divider sx={{ my: 3, opacity: 0.5 }} />

                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1.5,
                        }}
                      >
                        {t('auth.developer.headers', 'Headers')}
                      </Typography>

                      <Stack spacing={1}>
                        {[
                          { key: 'Authorization', value: 'Bearer <TOKEN>' },
                          { key: 'Content-Type', value: 'application/json' },
                          { key: 'Accept', value: 'application/json' },
                        ].map(({ key, value }) => (
                          <Box
                            key={key}
                            sx={{
                              display: 'flex',
                              gap: 2,
                              px: 2,
                              py: 1,
                              borderRadius: 1.5,
                              bgcolor: alpha(theme.palette.text.primary, 0.03),
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: 'primary.main',
                                width: 160,
                                flexShrink: 0,
                              }}
                            >
                              {key}
                            </Typography>
                            <Typography
                              variant='caption'
                              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </TabPanel>

                    {/* Tab 3 â€” SDK */}
                    <TabPanel value={detailTab} index={3}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1.5,
                        }}
                      >
                        {t('auth.developer.sdkSnippets', 'SDK Snippets')}
                      </Typography>

                      <Grid container spacing={2}>
                        {[
                          { lang: 'JavaScript (apiClient)', code: jsSnippet(selectedEndpoint) },
                          { lang: 'Python (Requests)', code: pythonSnippet(selectedEndpoint) },
                        ].map(({ lang, code }) => (
                          <Grid size={{ xs: 12 }} key={lang}>
                            <Paper
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                position: 'relative',
                                bgcolor: alpha(theme.palette.text.primary, 0.02),
                              }}
                            >
                              <Typography
                                variant='caption'
                                sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 40,
                                  fontWeight: 800,
                                  color: 'text.disabled',
                                  fontSize: '0.65rem',
                                }}
                              >
                                {lang.toUpperCase()}
                              </Typography>
                              <IconButton
                                size='small'
                                sx={{ position: 'absolute', top: 4, right: 4 }}
                                onClick={() => handleCopy(code)}
                              >
                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography
                                component='pre'
                                variant='caption'
                                sx={{
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  m: 0,
                                  display: 'block',
                                  lineHeight: 1.6,
                                }}
                              >
                                {code}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </TabPanel>

                    {/* Tab 2 â€” Try It */}
                    <TabPanel value={detailTab} index={2}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.04),
                          border: '1px solid',
                          borderColor: alpha(theme.palette.info.main, 0.12),
                          textAlign: 'center',
                          mb: 3,
                        }}
                      >
                        <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                          {t('auth.developer.sandboxMode', 'Sandbox Mode')}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {t(
                            'auth.developer.sandboxModeDesc',
                            'Requests run against the isolated staging environment. No production data is affected.',
                          )}
                        </Typography>
                      </Box>

                      {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.075em',
                              color: 'text.secondary',
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            {t('auth.developer.requestBody', 'Request Body (JSON)')}
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            variant='outlined'
                            placeholder='{ "key": "value" }'
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.text.primary, 0.02),
                              },
                            }}
                          />
                        </Box>
                      )}

                      <Button
                        variant='contained'
                        fullWidth
                        size='large'
                        onClick={handleExecuteSandbox}
                        disabled={sandboxLoading}
                        startIcon={
                          sandboxLoading ? (
                            <CircularProgress size={20} color='inherit' />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '1rem',
                          py: 1.5,
                          bgcolor: 'info.main',
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(0,118,255,0.3)',
                          '&:hover': { bgcolor: 'info.dark' },
                        }}
                      >
                        {sandboxLoading
                          ? t('common.loading', 'Loading...')
                          : t('auth.developer.sendSandboxRequest', 'Send Sandbox Request')}
                      </Button>

                      {sandboxResponse && (
                        <Box sx={{ mt: 4 }}>
                          <Stack
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                            sx={{ mb: 1.5 }}
                          >
                            <Stack direction='row' spacing={1.5} alignItems='center'>
                              <Typography
                                variant='caption'
                                sx={{
                                  fontWeight: 800,
                                  color: 'text.secondary',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {t('auth.developer.response', 'Response')}
                              </Typography>
                              <Chip
                                label={sandboxResponse.status}
                                size='small'
                                color={sandboxResponse.status < 400 ? 'success' : 'error'}
                                sx={{ fontWeight: 800, height: 20, fontSize: '0.75rem' }}
                              />
                            </Stack>
                            <Button
                              size='small'
                              variant='text'
                              onClick={() => setSandboxResponse(null)}
                              sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}
                            >
                              {t('common.clear', 'Clear')}
                            </Button>
                          </Stack>

                          <Paper
                            sx={{
                              bgcolor: alpha(theme.palette.text.primary, 0.04),
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 3,
                              p: 2.5,
                              maxHeight: 400,
                              overflow: 'auto',
                            }}
                          >
                            <Typography
                              component='pre'
                              variant='body2'
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                                lineHeight: 1.6,
                                m: 0,
                                color: 'text.primary',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                              }}
                            >
                              {JSON.stringify(sandboxResponse.data, null, 2)}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </TabPanel>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 14,
                  gap: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 4,
                }}
              >
                <ApiIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                  {t('auth.developer.selectEndpoint', 'Select an endpoint')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t(
                    'auth.developer.selectEndpointDesc',
                    'Pick a route from the panel on the left to view its details.',
                  )}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
