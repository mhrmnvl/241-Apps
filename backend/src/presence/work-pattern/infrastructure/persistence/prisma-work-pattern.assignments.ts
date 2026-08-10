import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { WorkPatternAssignmentWithDetails } from '../../domain/entities/work-pattern.entity.js';
import { AssignWorkPatternInput } from '../../domain/interfaces/work-pattern-repository.interface.js';

/**
 * Who works which pattern, from when.
 *
 * Split from the repository class for its line budget; kept together because
 * the supersede-don't-overwrite rule below is the whole reason "which pattern
 * was in force on that day" stays answerable.
 */

export const ASSIGNMENT_INCLUDE = {
  user: {
    select: { id: true, identifier: true, profile: { select: { name: true } } },
  },
  workPattern: { select: { name: true } },
} satisfies Prisma.WorkPatternAssignmentInclude;

type AssignmentRow = Prisma.WorkPatternAssignmentGetPayload<{
  include: typeof ASSIGNMENT_INCLUDE;
}>;

function toDetails(row: AssignmentRow): WorkPatternAssignmentWithDetails {
  const { user, workPattern, ...assignment } = row;

  return {
    ...assignment,
    patternName: workPattern.name,
    holder: {
      id: user.id,
      identifier: user.identifier,
      displayName: user.profile?.name ?? null,
    },
  };
}

export async function findAssignments(
  prisma: PrismaService,
  userId?: string,
): Promise<WorkPatternAssignmentWithDetails[]> {
  const rows = await prisma.workPatternAssignment.findMany({
    where: { deletedAt: null, ...(userId && { userId }) },
    include: ASSIGNMENT_INCLUDE,
    orderBy: { effectiveFrom: 'desc' },
  });

  return rows.map(toDetails);
}

/**
 * Closing the previous assignment the day before the new one starts, in the
 * same transaction, is what keeps "which pattern was in force" answerable for
 * any date — two open assignments would make it ambiguous.
 */
export async function assign(
  prisma: PrismaService,
  input: AssignWorkPatternInput,
): Promise<WorkPatternAssignmentWithDetails> {
  const { userId, workPatternId, effectiveFrom } = input;
  const dayBefore = new Date(effectiveFrom);
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);

  const row = await prisma.$transaction(async (tx) => {
    await tx.workPatternAssignment.updateMany({
      where: {
        userId,
        deletedAt: null,
        effectiveTo: null,
        effectiveFrom: { lt: effectiveFrom },
      },
      data: { effectiveTo: dayBefore },
    });

    return tx.workPatternAssignment.create({
      data: { userId, workPatternId, effectiveFrom },
      include: ASSIGNMENT_INCLUDE,
    });
  });

  return toDetails(row);
}

export async function removeAssignment(
  prisma: PrismaService,
  id: string,
): Promise<void> {
  await prisma.workPatternAssignment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
