import { ApprovalInstanceEntity } from '../entities/approval-instance.entity.js';
import { ApprovalLogEntity } from '../entities/approval-log.entity.js';
import { ApprovalWorkflowEntity } from '../entities/approval-workflow.entity.js';

export type {
  ApprovalInstanceEntity,
  ApprovalLogEntity,
  ApprovalWorkflowEntity,
};

/** Loan snapshot attached to a pending approval for display. */
export interface ApprovalLoanDetailRow {
  id: string;
  loanNumber: string;
  purpose?: string | null;
  expectedReturnDate?: Date | null;
  items?: {
    id: string;
    unitId: string;
    unit?: {
      id: string;
      unitNumber: string;
      asset?: { id: string; name: string } | null;
    } | null;
  }[];
}

export interface CreateApprovalWorkflowStepInput {
  stepSequence: number;
  approverRoleId: string;
  isMandatory?: boolean;
}

/**
 * Steps arrive as a flat list; composing them into the ORM's nested-write form
 * is the persistence adapter's job.
 */
export interface CreateApprovalWorkflowInput {
  name: string;
  targetEntity: string;
  description?: string | null;
  isActive?: boolean;
  steps: CreateApprovalWorkflowStepInput[];
}

export interface UpdateApprovalInstanceInput {
  statusId?: string;
  currentStepSequence?: number;
}

export interface CreateApprovalLogInput {
  instanceId: string;
  stepSequence: number;
  approverId: string;
  actionId: string;
  note?: string | null;
}

export interface ProcessApprovalTransactionInput {
  instanceId: string;
  referenceId: string;
  currentStepSequence: number;
  action: 'APPROVE' | 'REJECT';
  userId: string;
  note?: string | null;
  pendingStatusId: string;
  hasNextStep: boolean;
  nextStepSequence?: number;
}

export interface ProcessApprovalResult {
  success: boolean;
  action: 'REJECT' | 'APPROVE_STEP' | 'APPROVE_FINAL';
  /** Present only when the approval advanced to a further step. */
  nextStepSequence?: number;
  log: ApprovalLogEntity;
}

export abstract class IApprovalRepository {
  abstract findAllWorkflows(): Promise<ApprovalWorkflowEntity[]>;
  abstract findWorkflowById(id: string): Promise<ApprovalWorkflowEntity | null>;
  abstract createWorkflow(
    input: CreateApprovalWorkflowInput,
  ): Promise<ApprovalWorkflowEntity>;
  abstract findInstanceById(id: string): Promise<ApprovalInstanceEntity | null>;
  abstract updateInstance(
    id: string,
    input: UpdateApprovalInstanceInput,
  ): Promise<ApprovalInstanceEntity>;
  abstract createLog(input: CreateApprovalLogInput): Promise<ApprovalLogEntity>;
  abstract findPendingInstancesForRoles(
    roleCodes: string[],
  ): Promise<ApprovalInstanceEntity[]>;
  abstract findUserRoleCodes(userId: string): Promise<string[]>;
  abstract findStatusBySystemKey(key: string): Promise<{ id: string } | null>;
  abstract processApprovalTransaction(
    params: ProcessApprovalTransactionInput,
  ): Promise<ProcessApprovalResult>;
  abstract findLoanDetailsForInstance(
    referenceId: string,
  ): Promise<ApprovalLoanDetailRow | null>;
}
