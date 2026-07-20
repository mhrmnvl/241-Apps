import { Classroom, Prisma } from '@prisma/client';
import { ClassroomQueryDto } from '../../dto/classroom-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const CLASS_INCLUDE = {
  academicYear: true,
  grade: true,
} satisfies Prisma.ClassroomInclude;

export type ClassroomWithDetails = Prisma.ClassroomGetPayload<{
  include: typeof CLASS_INCLUDE;
}>;

export interface CreateClassroomRepositoryInput {
  academicYearId: string;
  gradeId: string;
  code: string;
  name: string | null;
  capacity: number;
  isActive?: boolean;
}

export abstract class IClassroomRepository {
  abstract findAll(
    query: ClassroomQueryDto,
  ): Promise<PaginatedResult<ClassroomWithDetails>>;
  abstract findById(id: string): Promise<ClassroomWithDetails | null>;
  abstract findDuplicate(
    academicYearId: string,
    gradeId: string,
    code: string,
    excludeId?: string,
  ): Promise<Classroom | null>;
  abstract create(
    data: CreateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails>;
  abstract update(
    id: string,
    data: Prisma.ClassroomUpdateInput,
  ): Promise<ClassroomWithDetails>;
  abstract findByCode(code: string): Promise<ClassroomWithDetails | null>;
  abstract findByAcademicYear(
    academicYearId: string,
  ): Promise<ClassroomWithDetails[]>;
  abstract softDelete(id: string): Promise<Classroom>;
}
