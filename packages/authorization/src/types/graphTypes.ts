import type { Node, Edge } from '@xyflow/react'
import type { PolicyAction, PolicyEffect, PolicySet, PolicySubject, PolicyResource } from './policy.types'

/**
 * 5 Visual Node Types supported on the Policy Canvas
 */
export type PolicyNodeType = 'subject' | 'action' | 'resource' | 'condition' | 'decision'

/**
 * Subject/Principal Node Data
 */
export interface SubjectNodeData extends Record<string, unknown> {
  label: string
  roles: string[]
  permissions?: string[]
  requiredAttributes?: Record<string, string | number | boolean>
  minRiskScore?: number
  requireMfa?: boolean
}

/**
 * Action Node Data
 */
export interface ActionNodeData extends Record<string, unknown> {
  label: string
  actions: PolicyAction[]
}

/**
 * Resource Node Data
 */
export interface ResourceNodeData extends Record<string, unknown> {
  label: string
  resourceType: string
  attributeMatchers?: Array<{
    key: string
    operator: 'equals' | 'notEquals' | 'contains' | 'in'
    value: string
  }>
}

/**
 * Condition / ABAC Predicate Node Data
 */
export interface ConditionNodeData extends Record<string, unknown> {
  label: string
  conditionId: string
  operator: 'AND' | 'OR'
  customExpression?: string
  args?: Record<string, unknown>
}

/**
 * Policy Decision Terminal Node Data
 */
export interface DecisionNodeData extends Record<string, unknown> {
  label: string
  effect: PolicyEffect
  reason: string
  priority?: number
  stepUpMfaRequired?: boolean
}

/**
 * Strongly typed React Flow nodes for each tier
 */
export type SubjectNode = Node<SubjectNodeData, 'subject'>
export type ActionNode = Node<ActionNodeData, 'action'>
export type ResourceNode = Node<ResourceNodeData, 'resource'>
export type ConditionNode = Node<ConditionNodeData, 'condition'>
export type DecisionNode = Node<DecisionNodeData, 'decision'>

export type PolicyCanvasNode =
  | SubjectNode
  | ActionNode
  | ResourceNode
  | ConditionNode
  | DecisionNode

export type PolicyCanvasEdge = Edge

/**
 * Serialized Policy Graph Container
 */
export interface VisualPolicyGraph {
  id: string
  name: string
  description?: string
  version: string
  nodes: PolicyCanvasNode[]
  edges: PolicyCanvasEdge[]
  defaultEffect: PolicyEffect
  combiningAlgorithm: 'deny-overrides' | 'first-applicable' | 'permit-overrides'
  createdAt?: string
  updatedAt?: string
}

/**
 * Step-by-step trace log during simulation
 */
export interface EvaluationStepTrace {
  stepNumber: number
  nodeId: string
  nodeType: PolicyNodeType
  status: 'pass' | 'fail' | 'skipped'
  message: string
  timestamp: number
}

/**
 * Live Simulation Result
 */
export interface PolicySimulationResult {
  effect: PolicyEffect
  reason: string
  matchedDecisionNodeId?: string
  activeNodeIds: string[]
  activeEdgeIds: string[]
  stepTraces: EvaluationStepTrace[]
  durationMs: number
}

/**
 * Simulation input payload
 */
export interface PolicySimulationInput {
  subject: PolicySubject
  action: PolicyAction
  resource: PolicyResource
  environment?: Record<string, unknown>
}
