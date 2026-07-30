import {
  ApprovalWorkflow,
  ApprovalInstance,
  ApprovalLog,
  InventoryStatusKey,
  Prisma,
} from '@prisma/client';

/**
 * An approval instance with the relations the use-cases rely on
 * (`workflow.steps` and `logs`) eagerly loaded.
 */
export type ApprovalInstanceWithRelations = Prisma.ApprovalInstanceGetPayload<{
  include: {
    workflow: { include: { steps: true } };
    logs: true;
  };
}>;

export abstract class IApprovalRepository {
  abstract findAllWorkflows(): Promise<ApprovalWorkflow[]>;
  abstract findWorkflowById(id: string): Promise<ApprovalWorkflow | null>;
  abstract createWorkflow(
    data: Prisma.ApprovalWorkflowCreateInput,
  ): Promise<ApprovalWorkflow>;

  abstract findInstanceById(
    id: string,
  ): Promise<ApprovalInstanceWithRelations | null>;
  abstract updateInstance(
    id: string,
    data: Prisma.ApprovalInstanceUpdateInput,
  ): Promise<ApprovalInstance>;

  abstract createLog(data: Prisma.ApprovalLogCreateInput): Promise<ApprovalLog>;

  abstract findPendingInstancesForRoles(
    roleCodes: string[],
  ): Promise<ApprovalInstanceWithRelations[]>;

  abstract findLoanDetailsForInstance(
    referenceId: string,
  ): Promise<Record<string, unknown> | null>;

  abstract findUserRoleCodes(userId: string): Promise<string[]>;

  abstract findStatusBySystemKey(
    key: InventoryStatusKey,
  ): Promise<{ id: string } | null>;

  abstract processApprovalTransaction(params: {
    instanceId: string;
    referenceId: string;
    currentStepSequence: number;
    action: 'APPROVE' | 'REJECT';
    userId: string;
    note?: string | null;
    pendingStatusId: string;
    hasNextStep: boolean;
    nextStepSequence?: number;
  }): Promise<unknown>;
}
