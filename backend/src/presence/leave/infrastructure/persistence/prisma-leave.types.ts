import { PrismaService } from '../../../../core/database/prisma.service.js';
import { LeaveTypeEntity } from '../../domain/entities/leave.entity.js';
import {
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
} from '../../domain/interfaces/leave-repository.interface.js';

/**
 * The school's own list of leave kinds — reference data, not business logic.
 *
 * Split from the repository class for its line budget: these six queries have
 * nothing to do with the request lifecycle they sat beside.
 */

export async function findTypes(
  prisma: PrismaService,
  includeInactive = false,
): Promise<LeaveTypeEntity[]> {
  return prisma.leaveType.findMany({
    where: { deletedAt: null, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: { name: 'asc' },
  });
}

export async function findTypeById(
  prisma: PrismaService,
  id: string,
): Promise<LeaveTypeEntity | null> {
  return prisma.leaveType.findFirst({ where: { id, deletedAt: null } });
}

export async function createType(
  prisma: PrismaService,
  input: CreateLeaveTypeInput,
): Promise<LeaveTypeEntity> {
  return prisma.leaveType.create({ data: input });
}

export async function updateType(
  prisma: PrismaService,
  id: string,
  input: UpdateLeaveTypeInput,
): Promise<LeaveTypeEntity> {
  return prisma.leaveType.update({ where: { id }, data: input });
}

/** Deactivated as well as soft-deleted, so nothing can still be filed under it. */
export async function softDeleteType(
  prisma: PrismaService,
  id: string,
): Promise<LeaveTypeEntity> {
  return prisma.leaveType.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function countRequestsOfType(
  prisma: PrismaService,
  leaveTypeId: string,
): Promise<number> {
  return prisma.leaveRequest.count({ where: { leaveTypeId, deletedAt: null } });
}
