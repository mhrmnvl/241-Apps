import { Curricula, Prisma } from '@prisma/client';
import { CurriculaQueryDto } from '../../dto/curriculum-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const CURRICULUM_INCLUDE = {
  academicYear: true,
  classrooms: {
    where: { deletedAt: null },
    orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
  },
  curriculumSubjects: {
    where: { deletedAt: null },
    orderBy: [{ grade: { level: 'asc' } }],
    include: { subject: true },
  },
} satisfies Prisma.CurriculaInclude;

export type CurriculumWithDetails = Prisma.CurriculaGetPayload<{
  include: typeof CURRICULUM_INCLUDE;
}>;

export abstract class ICurriculumRepository {
  abstract findAll(
    query: CurriculaQueryDto,
  ): Promise<PaginatedResult<CurriculumWithDetails>>;

  abstract findById(id: string): Promise<CurriculumWithDetails | null>;

  abstract findByNameAndAcademicYear(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ): Promise<Curricula | null>;

  abstract create(data: {
    academicYearId: string;
    name: string;
    isActive?: boolean;
  }): Promise<Curricula>;

  abstract update(
    id: string,
    data: Prisma.CurriculaUpdateInput,
  ): Promise<Curricula>;

  abstract softDelete(id: string): Promise<Curricula>;
}
