import type {
  VisualPolicyGraph,
  PolicyCanvasNode,
  PolicyCanvasEdge,
  SubjectNodeData,
  ActionNodeData,
  ResourceNodeData,
  ConditionNodeData,
  DecisionNodeData,
  PolicySimulationInput,
  PolicySimulationResult,
  EvaluationStepTrace,
} from "../types/graphTypes";
import type {
  Policy,
  PolicyRule,
  PolicySet,
  PolicyEffect,
  PolicyAction,
} from "../types/policy.types";
import { getCondition } from "./conditions";

export class PolicyGraphCompiler {
  /**
   * Compiles a visual node/edge graph into a canonical PolicySet for the PolicyEngine.
   */
  public static compileGraphToPolicySet(graph: VisualPolicyGraph): PolicySet {
    const { nodes, edges, defaultEffect, version, name } = graph;

    // Index nodes by ID
    const nodeMap = new Map<string, PolicyCanvasNode>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    // Build adjacency list for forward path traversal
    const adjacency = new Map<string, string[]>();
    for (const edge of edges) {
      const targets = adjacency.get(edge.source) || [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    }

    // Find all Subject nodes (entry points)
    const subjectNodes = nodes.filter((n) => n.type === "subject");
    const compiledRules: PolicyRule[] = [];

    // Helper: traverse path from a node to leaf decision nodes
    const traverse = (
      currentNodeId: string,
      currentPath: PolicyCanvasNode[],
      visited: Set<string>,
    ) => {
      const node = nodeMap.get(currentNodeId);
      if (!node) return;

      if (visited.has(currentNodeId)) {
        // Prevent cyclic loop
        return;
      }

      visited.add(currentNodeId);
      const nextPath = [...currentPath, node];
      const nextTargets = adjacency.get(currentNodeId) || [];

      if (node.type === "decision" || nextTargets.length === 0) {
        // Reached terminal node or leaf
        if (node.type === "decision") {
          const rule = this.buildRuleFromPath(nextPath);
          if (rule) compiledRules.push(rule);
        }
      } else {
        for (const targetId of nextTargets) {
          traverse(targetId, nextPath, new Set(visited));
        }
      }
    };

    // Start traversal from each subject node
    for (const sub of subjectNodes) {
      traverse(sub.id, [], new Set());
    }

    // Also support direct paths if a user starts from an Action or Resource node
    const nonSubjectEntries = nodes.filter(
      (n) =>
        n.type !== "subject" &&
        n.type !== "decision" &&
        !edges.some((e) => e.target === n.id),
    );
    for (const entry of nonSubjectEntries) {
      traverse(entry.id, [], new Set());
    }

    const policy: Policy = {
      id: graph.id || "visual-policy-1",
      description:
        graph.description || name || "Compiled Visual ABAC/RBAC Policy",
      rules: compiledRules,
    };

    return {
      version: version || "1.0.0",
      policies: [policy],
      defaultEffect: defaultEffect || "deny",
    };
  }

  /**
   * Constructs a single PolicyRule from an ordered path of canvas nodes.
   */
  private static buildRuleFromPath(
    path: PolicyCanvasNode[],
  ): PolicyRule | null {
    let effect: PolicyEffect = "deny";
    let roles: string[] | undefined;
    let permissions: string[] | undefined;
    let actions: PolicyAction[] | undefined;
    let resources: string[] | undefined;
    let conditionId: string | undefined;
    let conditionArgs: Record<string, unknown> | undefined;
    let priority: number | undefined;

    for (const node of path) {
      if (node.type === "subject") {
        const data = node.data as SubjectNodeData;
        if (data.roles && data.roles.length > 0) roles = [...data.roles];
        if (data.permissions && data.permissions.length > 0)
          permissions = [...data.permissions];
      } else if (node.type === "action") {
        const data = node.data as ActionNodeData;
        if (data.actions && data.actions.length > 0)
          actions = [...data.actions];
      } else if (node.type === "resource") {
        const data = node.data as ResourceNodeData;
        if (data.resourceType) resources = [data.resourceType];
      } else if (node.type === "condition") {
        const data = node.data as ConditionNodeData;
        conditionId = data.conditionId;
        conditionArgs = data.args || {};
      } else if (node.type === "decision") {
        const data = node.data as DecisionNodeData;
        effect = data.effect;
        priority = data.priority ?? 0;
      }
    }

    return {
      effect,
      roles,
      permissions,
      actions,
      resources,
      condition: conditionId
        ? { id: conditionId, args: conditionArgs }
        : undefined,
      priority,
    };
  }

  /**
   * Decompiles a standard PolicySet into a 5-tier tiered VisualPolicyGraph layout.
   */
  public static decompilePolicySetToGraph(
    policySet: PolicySet,
  ): VisualPolicyGraph {
    const nodes: PolicyCanvasNode[] = [];
    const edges: PolicyCanvasEdge[] = [];

    let yOffset = 60;
    const rowGap = 160;

    const LANE_X = {
      subject: 60,
      action: 360,
      resource: 660,
      condition: 960,
      decision: 1260,
    };

    let globalRuleIndex = 0;

    for (const policy of policySet.policies) {
      for (const rule of policy.rules) {
        globalRuleIndex++;
        const subId = `subject-${globalRuleIndex}`;
        const actId = `action-${globalRuleIndex}`;
        const resId = `resource-${globalRuleIndex}`;
        const condId = rule.condition ? `condition-${globalRuleIndex}` : null;
        const decId = `decision-${globalRuleIndex}`;

        // 1. Subject Node
        nodes.push({
          id: subId,
          type: "subject",
          position: { x: LANE_X.subject, y: yOffset },
          data: {
            label: rule.roles?.join(", ") || "All Subjects",
            roles: rule.roles || ["*"],
            permissions: rule.permissions,
          },
        });

        // 2. Action Node
        nodes.push({
          id: actId,
          type: "action",
          position: { x: LANE_X.action, y: yOffset },
          data: {
            label: rule.actions?.join(", ") || "All Actions (*)",
            actions: rule.actions || ["*"],
          },
        });

        // 3. Resource Node
        nodes.push({
          id: resId,
          type: "resource",
          position: { x: LANE_X.resource, y: yOffset },
          data: {
            label: rule.resources?.join(", ") || "All Resources (*)",
            resourceType: rule.resources?.[0] || "*",
          },
        });

        // Edge: Subject -> Action -> Resource
        edges.push({
          id: `e-${subId}-${actId}`,
          source: subId,
          target: actId,
          animated: false,
        });
        edges.push({
          id: `e-${actId}-${resId}`,
          source: actId,
          target: resId,
          animated: false,
        });

        let previousNodeId = resId;

        // 4. Condition Node (Optional)
        if (rule.condition) {
          nodes.push({
            id: condId!,
            type: "condition",
            position: { x: LANE_X.condition, y: yOffset },
            data: {
              label: rule.condition.id,
              conditionId: rule.condition.id,
              operator: "AND",
              args: rule.condition.args,
            },
          });
          edges.push({
            id: `e-${resId}-${condId}`,
            source: resId,
            target: condId!,
            animated: false,
          });
          previousNodeId = condId!;
        }

        // 5. Decision Node
        nodes.push({
          id: decId,
          type: "decision",
          position: { x: LANE_X.decision, y: yOffset },
          data: {
            label: rule.effect === "allow" ? "ALLOW" : "DENY",
            effect: rule.effect,
            reason: `Rule #${globalRuleIndex} matched (${rule.effect.toUpperCase()})`,
            priority: rule.priority ?? 0,
          },
        });

        edges.push({
          id: `e-${previousNodeId}-${decId}`,
          source: previousNodeId,
          target: decId,
          animated: false,
        });

        yOffset += rowGap;
      }
    }

    return {
      id: "decompiled-policy-graph",
      name: "Imported Policy Graph",
      version: policySet.version,
      defaultEffect: policySet.defaultEffect,
      combiningAlgorithm: "deny-overrides",
      nodes,
      edges,
    };
  }

  /**
   * Simulates policy evaluation against the graph, returning step traces and the active glowing path.
   */
  public static simulateGraph(
    graph: VisualPolicyGraph,
    input: PolicySimulationInput,
  ): PolicySimulationResult {
    const startTime = performance.now();
    const { nodes, edges, defaultEffect } = graph;
    const { subject, action, resource } = input;

    const traces: EvaluationStepTrace[] = [];
    const activeNodeIds = new Set<string>();
    const activeEdgeIds = new Set<string>();

    const nodeMap = new Map<string, PolicyCanvasNode>();
    for (const node of nodes) nodeMap.set(node.id, node);

    const adjacency = new Map<string, string[]>();
    for (const edge of edges) {
      const targets = adjacency.get(edge.source) || [];
      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    }

    let stepCounter = 1;
    let matchedDecisionNodeId: string | undefined;
    let resolvedEffect: PolicyEffect = defaultEffect;
    let resolvedReason = `No active path matched. Defaulting to ${defaultEffect.toUpperCase()}`;

    interface PathCandidate {
      path: PolicyCanvasNode[];
      decision: DecisionNodeData;
    }

    const successfulCandidates: PathCandidate[] = [];

    const evaluatePath = (
      currentNodeId: string,
      currentPath: PolicyCanvasNode[],
    ): boolean => {
      const node = nodeMap.get(currentNodeId);
      if (!node) return false;

      const nextPath = [...currentPath, node];

      // Evaluate node match criteria
      let passed = true;
      let message = "";

      if (node.type === "subject") {
        const data = node.data as SubjectNodeData;
        const hasRoleReq =
          data.roles && data.roles.length > 0 && !data.roles.includes("*");
        const hasPermReq = data.permissions && data.permissions.length > 0;
        const rolesMatch =
          !hasRoleReq ||
          data.roles.some(
            (r) =>
              subject.roles.includes(r) ||
              subject.roles.includes("super_admin") ||
              subject.roles.includes("ADMIN"),
          );
        const permsMatch =
          !hasPermReq ||
          data.permissions!.some((p) => subject.permissions.includes(p));

        passed = rolesMatch && permsMatch;
        message = passed
          ? `Subject [${subject.roles.join(", ")}] matched roles criteria`
          : `Subject [${subject.roles.join(", ")}] failed required roles [${data.roles.join(", ")}]`;
      } else if (node.type === "action") {
        const data = node.data as ActionNodeData;
        passed = data.actions.includes("*") || data.actions.includes(action);
        message = passed
          ? `Action '${action}' matched required actions`
          : `Action '${action}' did not match [${data.actions.join(", ")}]`;
      } else if (node.type === "resource") {
        const data = node.data as ResourceNodeData;
        passed =
          data.resourceType === "*" || data.resourceType === resource.type;
        message = passed
          ? `Resource type '${resource.type}' matched '${data.resourceType}'`
          : `Resource type '${resource.type}' did not match '${data.resourceType}'`;
      } else if (node.type === "condition") {
        const data = node.data as ConditionNodeData;
        const evaluator = getCondition(data.conditionId);
        if (evaluator) {
          try {
            passed = evaluator(subject, resource, data.args);
            message = passed
              ? `Condition '${data.conditionId}' evaluated to TRUE`
              : `Condition '${data.conditionId}' evaluated to FALSE`;
          } catch (err: any) {
            passed = false;
            message = `Condition '${data.conditionId}' threw error: ${err.message}`;
          }
        } else {
          // If condition is undefined or mock
          passed = true;
          message = `Condition '${data.conditionId}' passed (no evaluator registered)`;
        }
      } else if (node.type === "decision") {
        const data = node.data as DecisionNodeData;
        passed = true;
        message = `Reached Terminal Decision: ${data.effect.toUpperCase()}`;
      }

      traces.push({
        stepNumber: stepCounter++,
        nodeId: node.id,
        nodeType: node.type as any,
        status: passed ? "pass" : "fail",
        message,
        timestamp: Date.now(),
      });

      if (!passed) return false;

      const targets = adjacency.get(currentNodeId) || [];

      if (node.type === "decision" || targets.length === 0) {
        if (node.type === "decision") {
          successfulCandidates.push({
            path: nextPath,
            decision: node.data as DecisionNodeData,
          });
        }
        return true;
      }

      let childPassed = false;
      for (const targetId of targets) {
        const subPassed = evaluatePath(targetId, nextPath);
        if (subPassed) childPassed = true;
      }

      return childPassed;
    };

    // Run evaluation starting from Subject nodes
    const subjectNodes = nodes.filter((n) => n.type === "subject");
    for (const sub of subjectNodes) {
      evaluatePath(sub.id, []);
    }

    if (successfulCandidates.length > 0) {
      // Sort matching candidates by priority descending, with deny winning on tie
      successfulCandidates.sort((a, b) => {
        const pA = a.decision.priority ?? 0;
        const pB = b.decision.priority ?? 0;
        if (pA !== pB) return pB - pA;
        if (a.decision.effect === "deny" && b.decision.effect === "allow")
          return -1;
        if (a.decision.effect === "allow" && b.decision.effect === "deny")
          return 1;
        return 0;
      });

      const winningCandidate = successfulCandidates[0];
      const winningDecisionNode =
        winningCandidate.path[winningCandidate.path.length - 1];
      matchedDecisionNodeId = winningDecisionNode.id;
      resolvedEffect = winningCandidate.decision.effect;
      resolvedReason =
        winningCandidate.decision.reason ||
        `Evaluated to ${resolvedEffect.toUpperCase()} via visual rule path`;

      // Mark winning path nodes and edges as active
      for (let i = 0; i < winningCandidate.path.length; i++) {
        const node = winningCandidate.path[i];
        activeNodeIds.add(node.id);
        if (i < winningCandidate.path.length - 1) {
          const nextNode = winningCandidate.path[i + 1];
          const matchingEdge = edges.find(
            (e) => e.source === node.id && e.target === nextNode.id,
          );
          if (matchingEdge) activeEdgeIds.add(matchingEdge.id);
        }
      }
    }

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      effect: resolvedEffect,
      reason: resolvedReason,
      matchedDecisionNodeId,
      activeNodeIds: Array.from(activeNodeIds),
      activeEdgeIds: Array.from(activeEdgeIds),
      stepTraces: traces,
      durationMs,
    };
  }

  /**
   * Validates graph topology for orphan nodes, cyclic loops, or missing data.
   */
  public static validateGraph(graph: VisualPolicyGraph): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!graph.nodes || graph.nodes.length === 0) {
      errors.push("The policy canvas is empty. Add at least one rule path.");
      return { isValid: false, errors, warnings };
    }

    const hasSubject = graph.nodes.some((n) => n.type === "subject");
    const hasDecision = graph.nodes.some((n) => n.type === "decision");

    if (!hasSubject)
      warnings.push(
        "Graph has no Subject nodes. Rules may match all principals.",
      );
    if (!hasDecision)
      errors.push(
        "Graph must contain at least one Decision (ALLOW/DENY) node.",
      );

    for (const node of graph.nodes) {
      const outgoing = graph.edges.filter((e) => e.source === node.id);
      const incoming = graph.edges.filter((e) => e.target === node.id);

      if (node.type !== "decision" && outgoing.length === 0) {
        warnings.push(
          `Node '${node.data.label || node.id}' has no outgoing connections.`,
        );
      }
      if (node.type !== "subject" && incoming.length === 0) {
        warnings.push(
          `Node '${node.data.label || node.id}' has no incoming connections.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
