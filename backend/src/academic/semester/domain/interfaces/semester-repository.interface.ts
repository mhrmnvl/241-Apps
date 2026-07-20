import { Prisma, Semester, SemesterType } from '@prisma/client';
import { SemesterQueryDto } from '../../dto/request/semester-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const SEMESTER_INCLUDE = {
  academicYear: { select: { id: true, name: true } },
  type: { select: { id: true, name: true } },
} satisfies Prisma.SemesterInclude;

export type SemesterWithDetails = Prisma.SemesterGetPayload<{
  include: typeof SEMESTER_INCLUDE;
}>;

export interface CreateSemesterRepositoryInput {
  academicYearId: string;
  typeId: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export abstract class ISemesterRepository {
  abstract findAll(
    query: SemesterQueryDto,
  ): Promise<PaginatedResult<SemesterWithDetails>>;
  abstract findById(id: string): Promise<SemesterWithDetails | null>;
  abstract findActive(): Promise<SemesterWithDetails | null>;
  abstract findByAcademicYearAndType(
    academicYearId: string,
    typeId: string,
  ): Promise<Semester | null>;
  abstract create(
    data: CreateSemesterRepositoryInput,
  ): Promise<SemesterWithDetails>;
  abstract update(
    id: string,
    data: Prisma.SemesterUpdateInput,
  ): Promise<SemesterWithDetails>;
  abstract deactivateAll(): Promise<Prisma.BatchPayload>;
  abstract activateById(id: string): Promise<SemesterWithDetails>;
  abstract findTypeById(id: string): Promise<SemesterType | null>;
  abstract hasRelatedData(id: string): Promise<boolean>;
  abstract softDelete(id: string): Promise<Semester>;
}
