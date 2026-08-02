import { Prisma } from '@prisma/client';

export const WORKFLOW_WITH_STEPS_INCLUDE = {
  steps: {
    orderBy: { stepSequence: 'asc' as const },
  },
} satisfies Prisma.ApprovalWorkflowInclude;

export type WorkflowWithSteps = Prisma.ApprovalWorkflowGetPayload<{
  include: typeof WORKFLOW_WITH_STEPS_INCLUDE;
}>;

export const APPROVAL_INSTANCE_WITH_RELATIONS_INCLUDE = {
  workflow: {
    include: {
      steps: {
        orderBy: { stepSequence: 'asc' as const },
      },
    },
  },
  logs: true,
} satisfies Prisma.ApprovalInstanceInclude;

export type ApprovalInstanceWithRelations = Prisma.ApprovalInstanceGetPayload<{
  include: typeof APPROVAL_INSTANCE_WITH_RELATIONS_INCLUDE;
}>;
