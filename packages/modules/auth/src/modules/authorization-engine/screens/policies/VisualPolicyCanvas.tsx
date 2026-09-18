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

import { PolicyLiveSimulator } from './components/PolicyLiveSimulator'
import { PolicyTemplatePicker } from './components/PolicyTemplatePicker'

export default function VisualPolicyCanvas() {
  const theme = useTheme()
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
    toast.info(`Loaded template: ${template.name}`)
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
    toast.success(`Added ${type.toUpperCase()} node to canvas`)
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
    toast.success('Exported policy canvas JSON')
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
          toast.error('Invalid policy graph JSON format')
        }
      } catch (err: any) {
        toast.error(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Deploy compiled policy to live policyEngine
  const handleDeployToEngine = () => {
    const validation = PolicyGraphCompiler.validateGraph(currentGraph)
    if (!validation.isValid) {
      toast.error(`Cannot deploy invalid graph: ${validation.errors.join('; ')}`)
      return
    }

    const compiledPolicySet = PolicyGraphCompiler.compileGraphToPolicySet(currentGraph)
    policyEngine.setPolicySet(compiledPolicySet)
    toast.success(`Successfully compiled and deployed PolicySet to active Authorization Engine!`)
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
                Visual Policy & ABAC Canvas
              </Typography>
              <Chip
                label='V3 Flagship'
                size='small'
                color='primary'
                sx={{ height: 20, fontSize: 10, fontWeight: 900 }}
              />
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {currentGraph.name} • {nodes.length} Nodes • {edges.length} Connections
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
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            Add Node
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
              <ListItemText primary='Subject Node' secondary='Roles & principal attributes' />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('action')}>
              <ListItemIcon>
                <TouchAppIcon fontSize='small' color='info' />
              </ListItemIcon>
              <ListItemText primary='Action Node' secondary='Operations (read, write, delete)' />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('resource')}>
              <ListItemIcon>
                <FolderIcon fontSize='small' color='secondary' />
              </ListItemIcon>
              <ListItemText primary='Resource Node' secondary='Entity types and attributes' />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('condition')}>
              <ListItemIcon>
                <RuleIcon fontSize='small' color='warning' />
              </ListItemIcon>
              <ListItemText primary='Condition Node' secondary='ABAC predicate comparator' />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAddNode('decision', 'allow')}>
              <ListItemIcon>
                <CheckCircleIcon fontSize='small' color='success' />
              </ListItemIcon>
              <ListItemText primary='ALLOW Decision Node' secondary='Terminal allow effect' />
            </MenuItem>
            <MenuItem onClick={() => handleAddNode('decision', 'deny')}>
              <ListItemIcon>
                <BlockIcon fontSize='small' color='error' />
              </ListItemIcon>
              <ListItemText primary='DENY Decision Node' secondary='Terminal deny effect' />
            </MenuItem>
          </Menu>

          {/* Template Picker */}
          <Button
            variant='outlined'
            size='small'
            color='secondary'
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setTemplatePickerOpen(true)}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            Templates
          </Button>

          {/* Live Simulator Toggle */}
          <Button
            variant={simulatorOpen ? 'contained' : 'outlined'}
            size='small'
            color='info'
            startIcon={<PlayArrowIcon />}
            onClick={() => setSimulatorOpen((prev) => !prev)}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            Live Simulator
          </Button>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

          {/* Export JSON */}
          <Tooltip title='Export Policy Graph JSON'>
            <IconButton size='small' onClick={handleExportJSON}>
              <FileDownloadIcon fontSize='small' />
            </IconButton>
          </Tooltip>

          {/* Import JSON */}
          <Tooltip title='Import Policy Graph JSON'>
            <IconButton size='small' onClick={() => fileInputRef.current?.click()}>
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
            sx={{ fontWeight: 900, px: 2, borderRadius: 2 }}
          >
            Deploy Policy
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
            style={{
              backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#f8fafc',
            }}
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
                    return '#999'
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
