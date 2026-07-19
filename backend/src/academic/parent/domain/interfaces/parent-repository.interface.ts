import { Occupation, Parent, Prisma } from '@prisma/client';
import { CreateParentDto } from '../../dto/create-parent.dto.js';
import { ParentQueryDto } from '../../dto/parent-query.dto.js';
import { UpdateParentDto } from '../../dto/update-parent.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
} satisfies Prisma.AddressOmit;

export const PARENT_LIST_INCLUDE = {
  occupation: true,
  _count: { select: { addresses: true, studentParents: true } },
} satisfies Prisma.ParentInclude;

export const PARENT_DETAIL_INCLUDE = {
  occupation: true,
  addresses: { omit: ADDRESS_OMIT, orderBy: { isPrimary: 'desc' as const } },
  studentParents: {
    where: { student: { deletedAt: null } },
    orderBy: { isPrimary: 'desc' as const },
    include: {
      student: {
        select: {
          id: true,
          nis: true,
          nisn: true,
          status: true,
          user: { select: { profile: { select: { name: true } } } },
        },
      },
    },
  },
} satisfies Prisma.ParentInclude;

export type ParentWithDetails = Prisma.ParentGetPayload<{
  include: typeof PARENT_DETAIL_INCLUDE;
}>;

export type ParentListWithDetails = Prisma.ParentGetPayload<{
  include: typeof PARENT_LIST_INCLUDE;
}>;

export abstract class IParentRepository {
  abstract findAll(
    query: ParentQueryDto,
  ): Promise<PaginatedResult<ParentListWithDetails>>;
  abstract findById(id: string): Promise<ParentWithDetails | null>;
  abstract findByNik(nik: string, excludeId?: string): Promise<Parent | null>;
  abstract findOccupationById(id: string): Promise<Occupation | null>;
  abstract create(dto: CreateParentDto): Promise<ParentWithDetails>;
  abstract update(id: string, dto: UpdateParentDto): Promise<ParentWithDetails>;
  abstract softDelete(id: string): Promise<Parent>;
}
