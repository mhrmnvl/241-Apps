import {
  ApprovalWorkflow,
  ApprovalInstance,
  ApprovalLog,
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
}
