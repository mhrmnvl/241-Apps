/**
 * A step is only ever addressed as part of its workflow — it has no repository
 * operation of its own — so it belongs to the workflow aggregate.
 */
export interface ApprovalWorkflowStepEntity {
  id: string;
  workflowId: string;
  stepSequence: number;
  approverRoleId: string;
  isMandatory: boolean;
}

export interface ApprovalWorkflowEntity {
  id: string;
  name: string;
  targetEntity: string;
  description?: string | null;
  isActive: boolean;
  steps?: ApprovalWorkflowStepEntity[];
}
