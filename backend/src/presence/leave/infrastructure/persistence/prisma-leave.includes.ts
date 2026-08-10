import { Prisma } from '@prisma/client';
import { LeaveRequestWithDetails } from '../../domain/entities/leave.entity.js';

/** The shape every leave-request read returns, and its mapper. */
export const REQUEST_INCLUDE = {
  requester: { select: { id: true, profile: { select: { name: true } } } },
  approver: { select: { id: true, profile: { select: { name: true } } } },
  leaveType: {
    select: { id: true, code: true, name: true, treatment: true },
  },
  days: { select: { date: true }, orderBy: { date: 'asc' } },
} satisfies Prisma.LeaveRequestInclude;

type RequestRow = Prisma.LeaveRequestGetPayload<{
  include: typeof REQUEST_INCLUDE;
}>;

export function toDetails(row: RequestRow): LeaveRequestWithDetails {
  const { requester, approver, leaveType, days, ...request } = row;

  return {
    ...request,
    requester: {
      id: requester.id,
      displayName: requester.profile?.name ?? null,
    },
    approver: approver
      ? { id: approver.id, displayName: approver.profile?.name ?? null }
      : null,
    leaveType,
    days: days.map((day) => day.date),
  };
}
