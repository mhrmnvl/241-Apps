/**
 * A step is only ever addressed as part of its workflow — it has no repository
 * operation of its own — so it belongs to the workflow aggregate.
 */
export interface ApprovalWorkflowStepEntity {
  id: string;
  workflowId: string;
  stepSequence: number;
  /** The approving role's *code* — 'ADMIN', 'PRINCIPAL' — not an id. */
  approverRoleCode: string;
  /**
   * False leaves the step to the previous approver's judgement: they decide,
   * per request, whether it is also taken. A mandatory step is always taken.
   */
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
