import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import PersonIcon from '@mui/icons-material/Person'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import FolderIcon from '@mui/icons-material/Folder'
import RuleIcon from '@mui/icons-material/Rule'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import VisibilityIcon from '@mui/icons-material/Visibility'

import {
  policyCanvasNodeTypes,
  POLICY_CANVAS_TEMPLATES,
  PolicyGraphCompiler,
  policyEngine,
  type VisualPolicyGraph,
  type PolicyCanvasNode,
  type PolicyCanvasEdge,
  type PolicyNodeType,
  type PolicySimulationResult,
} from '@cap/authorization'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import { PolicyLiveSimulator } from './components/PolicyLiveSimulator'
import { PolicyTemplatePicker } from './components/PolicyTemplatePicker'

export default function VisualPolicyCanvas() {
  const theme = useTheme()
  const { t } = useTranslation()
  const initialTemplate = POLICY_CANVAS_TEMPLATES[0]

  const [nodes, setNodes, onNodesChange] = useNodesState<PolicyCanvasNode>(initialTemplate.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<PolicyCanvasEdge>(initialTemplate.edges)

  const [graphMeta, setGraphMeta] = useState({
    id: initialTemplate.id,
    name: initialTemplate.name,
    description: initialTemplate.description,
    version: initialTemplate.version,
    defaultEffect: initialTemplate.defaultEffect,
    combiningAlgorithm: initialTemplate.combiningAlgorithm,
  })

  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [addNodeAnchor, setAddNodeAnchor] = useState<null | HTMLElement>(null)
  const [simulationResult, setSimulationResult] = useState<PolicySimulationResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Edge connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: theme.palette.primary.main, strokeWidth: 2 },
          },
          eds,
        ),
      )
    },
    [setEdges, theme],
  )

  // Current graph object representation
  const currentGraph: VisualPolicyGraph = useMemo(() => {
    return {
      id: graphMeta.id,
      name: graphMeta.name,
      description: graphMeta.description,
      version: graphMeta.version,
      defaultEffect: graphMeta.defaultEffect,
      combiningAlgorithm: graphMeta.combiningAlgorithm,
      nodes: nodes as PolicyCanvasNode[],
      edges: edges as PolicyCanvasEdge[],
    }
  }, [graphMeta, nodes, edges])

  // Template loader
  const handleLoadTemplate = (template: VisualPolicyGraph) => {
    setGraphMeta({
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      defaultEffect: template.defaultEffect,
      combiningAlgorithm: template.combiningAlgorithm,
    })
    setNodes(template.nodes)
    setEdges(template.edges)
    setSimulationResult(null)
    toast.info(
      t('auth.admin.policy.toast_loaded', {
        name: template.name,
        defaultValue: 'Loaded template: {{name}}',
      }),
    )
  }

  // Adding node dynamically to center of view
  const handleAddNode = (type: PolicyNodeType, effect?: 'allow' | 'deny') => {
    const id = `${type}-${Date.now().toString().slice(-4)}`
    const position = {
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 200,
    }

    let newNode: PolicyCanvasNode

    switch (type) {
      case 'subject':
        newNode = {
          id,
          type: 'subject',
          position,
          data: {
            label: 'New Subject Group',
            roles: ['member'],
          },
        }
        break
      case 'action':
        newNode = {
          id,
          type: 'action',
          position,
          data: {
            label: 'Read / Write',
            actions: ['read', 'write'],
          },
        }
        break
      case 'resource':
        newNode = {
          id,
          type: 'resource',
          position,
          data: {
            label: 'Entity Resource',
            resourceType: 'document',
          },
        }
        break
      case 'condition':
        newNode = {
          id,
          type: 'condition',
          position,
          data: {
            label: 'Same Org Check',
            conditionId: 'sameOrg',
            operator: 'AND',
          },
        }
        break
      case 'decision':
        newNode = {
          id,
          type: 'decision',
          position,
          data: {
            label: effect === 'deny' ? 'DENY' : 'ALLOW',
            effect: effect || 'allow',
            reason:
              effect === 'deny' ? 'Unauthorized access attempt' : 'Access granted by policy rule',
            priority: 10,
          },
        }
        break
    }

    setNodes((nds) => [...nds, newNode])
    setAddNodeAnchor(null)
    toast.success(
      t('auth.admin.policy.toast_node_added', {
        type: t(`auth.admin.policy.node_${type}`, type),
        defaultValue: 'Added a {{type}} node',
      }),
    )
  }

  // Export graph to JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentGraph, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${currentGraph.id || 'policy-graph'}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success(t('auth.admin.policy.toast_exported', 'Policy graph exported.'))
  }

  // Import JSON file
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as VisualPolicyGraph
        if (parsed.nodes && parsed.edges) {
          handleLoadTemplate(parsed)
        } else {
          toast.error(
            t(
              'auth.admin.policy.toast_invalid_json',
              'That file is not a policy graph — it has no nodes or edges.',
            ),
          )
        }
      } catch (err: unknown) {
        toast.error(
          t('auth.admin.policy.toast_import_failed', {
            reason: err instanceof Error ? err.message : '',
            defaultValue: 'The file could not be imported. {{reason}}',
          }),
        )
      }
    }
    reader.readAsText(file)
  }

  // Deploy compiled policy to live policyEngine
  const handleDeployToEngine = () => {
    const validation = PolicyGraphCompiler.validateGraph(currentGraph)
    if (!validation.isValid) {
      toast.error(
        t('auth.admin.policy.toast_invalid_graph', {
          errors: validation.errors.join('; '),
          defaultValue: 'This graph cannot be deployed: {{errors}}',
        }),
      )
      return
    }

    const compiledPolicySet = PolicyGraphCompiler.compileGraphToPolicySet(currentGraph)
    policyEngine.setPolicySet(compiledPolicySet)
    toast.success(
      t('auth.admin.policy.toast_deployed', 'Policy compiled and deployed to the engine.'),
    )
  }

  // Handle simulation result highlighting
  const handleSimulationRun = (result: PolicySimulationResult) => {
    setSimulationResult(result)
  }

  // Styled edges with active glow during simulation
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const isActive = simulationResult?.activeEdgeIds.includes(edge.id)
      return {
        ...edge,
        animated: isActive || edge.animated,
        style: {
          stroke: isActive
            ? simulationResult?.effect === 'allow'
              ? theme.palette.success.main
              : theme.palette.error.main
            : alpha(theme.palette.text.secondary, 0.4),
          strokeWidth: isActive ? 3.5 : 1.5,
          filter: isActive
            ? `drop-shadow(0 0 6px ${
                simulationResult?.effect === 'allow'
                  ? theme.palette.success.main
                  : theme.palette.error.main
              })`
            : undefined,
        },
      }
    })
  }, [edges, simulationResult, theme])

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Top Action Bar */}
      <Paper
        elevation={2}
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(16px)',
          zIndex: 5,
        }}
      >
        {/* Title & Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <AccountTreeIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {t('auth.admin.policy.canvas_title', 'Policy canvas')}
              </Typography>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {t('auth.admin.policy.canvas_summary', {
                name: currentGraph.name,
                nodes: nodes.length,
                edges: edges.length,
                defaultValue: '{{name}} — {{nodes}} nodes, {{edges}} connections',
              })}
            </Typography>
          </Box>
        </Box>

        {/* Toolbar Action Buttons */}
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Add Node Menu */}
          <Button
            variant='outlined'
            size='small'
            startIcon={<AddCircleOutlineIcon />}
            onClick={(e) => setAddNodeAnchor(e.currentTarget)}
            sx={{ minHeight: 44, fontWeight: 800, borderRadius: 2 }}
          >
            {t('auth.admin.policy.add_node', 'Add node')}
          </Button>

          <Menu
            anchorEl={addNodeAnchor}
            open={Boolean(addNodeAnchor)}
            onClose={() => setAddNodeAnchor(null)}
          >
            <MenuItem onClick={() => handleAddNode('subject')}>
              <ListItemIcon>
                <PersonIcon fontSize='small' color='primary' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_subject', 'Subject')}
                secondary={t('auth.admin.policy.node_subject_desc', 'Roles and principal attributes')}
              />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('action')}>
              <ListItemIcon>
                <TouchAppIcon fontSize='small' color='info' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_action', 'Action')}
                secondary={t('auth.admin.policy.node_action_desc', 'Operations such as read, write or delete')}
              />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('resource')}>
              <ListItemIcon>
                <FolderIcon fontSize='small' color='secondary' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_resource', 'Resource')}
                secondary={t('auth.admin.policy.node_resource_desc', 'Entity types and attributes')}
              />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('condition')}>
              <ListItemIcon>
                <RuleIcon fontSize='small' color='warning' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_condition', 'Condition')}
                secondary={t('auth.admin.policy.node_condition_desc', 'An attribute test that must pass')}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAddNode('decision', 'allow')}>
              <ListItemIcon>
                <CheckCircleIcon fontSize='small' color='success' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_allow', 'Allow decision')}
                secondary={t('auth.admin.policy.node_allow_desc', 'Ends the path by granting access')}
              />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('decision', 'deny')}>
              <ListItemIcon>
                <BlockIcon fontSize='small' color='error' />
              </ListItemIcon>
              <ListItemText
                primary={t('auth.admin.policy.node_deny', 'Deny decision')}
                secondary={t('auth.admin.policy.node_deny_desc', 'Ends the path by refusing access')}
              />
            </MenuItem>
          </Menu>

          {/* Template Picker */}
          <Button
            variant='outlined'
            size='small'
            color='secondary'
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setTemplatePickerOpen(true)}
            sx={{ minHeight: 44, fontWeight: 800, borderRadius: 2 }}
          >
            {t('auth.admin.policy.templates', 'Templates')}
          </Button>

          {/* Live Simulator Toggle */}
          <Button
            variant={simulatorOpen ? 'contained' : 'outlined'}
            size='small'
            color='info'
            startIcon={<PlayArrowIcon />}
            onClick={() => setSimulatorOpen((prev) => !prev)}
            sx={{ minHeight: 44, fontWeight: 800, borderRadius: 2 }}
          >
            {t('auth.admin.policy.simulator', 'Simulator')}
          </Button>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          {/* Export JSON */}
          <Tooltip title={t('auth.admin.policy.export', 'Export policy graph')}>
            <IconButton
              onClick={handleExportJSON}
              aria-label={t('auth.admin.policy.export', 'Export policy graph')}
              sx={{ width: 44, height: 44 }}
            >
              <FileDownloadIcon fontSize='small' />
            </IconButton>
          </Tooltip>

          {/* Import JSON */}
          <Tooltip title={t('auth.admin.policy.import', 'Import policy graph')}>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('auth.admin.policy.import', 'Import policy graph')}
              sx={{ width: 44, height: 44 }}
            >
              <FileUploadIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <input
            type='file'
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept='.json'
            onChange={handleImportJSON}
          />

          {/* Deploy to Engine */}
          <Button
            variant='contained'
            color='success'
            size='small'
            startIcon={<CloudDoneIcon />}
            onClick={handleDeployToEngine}
            sx={{ minHeight: 44, fontWeight: 900, px: 2, borderRadius: 2 }}
          >
            {t('auth.admin.policy.deploy', 'Deploy policy')}
          </Button>
        </Stack>
      </Paper>

      {/* Main Flow Canvas Area */}
      <Box sx={{ flex: 1, position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
        <Box sx={{ flex: 1, height: '100%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={policyCanvasNodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            // Was two hex literals approximating the surfaces. Reading
            // the palette keeps the canvas on the tenant's own colours.
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <Controls
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'subject':
                    return theme.palette.primary.main
                  case 'action':
                    return theme.palette.info.main
                  case 'resource':
                    return theme.palette.secondary.main
                  case 'condition':
                    return theme.palette.warning.main
                  case 'decision':
                    return (node.data as any).effect === 'allow'
                      ? theme.palette.success.main
                      : theme.palette.error.main
                  default:
                    return theme.palette.text.disabled
                }
              }}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
              }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1.5}
              color={alpha(theme.palette.text.secondary, 0.2)}
            />
          </ReactFlow>
        </Box>

        {/* Live Simulator Drawer */}
        {simulatorOpen && (
          <PolicyLiveSimulator
            graph={currentGraph}
            onSimulationRun={handleSimulationRun}
            onClose={() => setSimulatorOpen(false)}
          />
        )}
      </Box>

      {/* Template Picker Dialog */}
      <PolicyTemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />
    </Box>
  )
}
