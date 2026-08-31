import type { NodeTypes } from "@xyflow/react";
import { SubjectNodeComponent } from "./SubjectNode";
import { ActionNodeComponent } from "./ActionNode";
import { ResourceNodeComponent } from "./ResourceNode";
import { ConditionNodeComponent } from "./ConditionNode";
import { DecisionNodeComponent } from "./DecisionNode";

export {
  SubjectNodeComponent,
  ActionNodeComponent,
  ResourceNodeComponent,
  ConditionNodeComponent,
  DecisionNodeComponent,
};

export const policyCanvasNodeTypes: NodeTypes = {
  subject: SubjectNodeComponent,
  action: ActionNodeComponent,
  resource: ResourceNodeComponent,
  condition: ConditionNodeComponent,
  decision: DecisionNodeComponent,
};
