import { CurriculumSubject, Prisma } from '@prisma/client';
import { CurriculumSubjectQueryDto } from '../../dto/curriculum-subject-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const CURRICULUM_SUBJECT_INCLUDE = {
  curricula: { include: { academicYear: true } },
  subject: true,
} satisfies Prisma.CurriculumSubjectInclude;

export type CurriculumSubjectWithDetails = Prisma.CurriculumSubjectGetPayload<{
  include: typeof CURRICULUM_SUBJECT_INCLUDE;
}>;

export abstract class ICurriculumSubjectRepository {
  abstract findAll(
    query: CurriculumSubjectQueryDto,
  ): Promise<PaginatedResult<CurriculumSubjectWithDetails>>;

  abstract findById(id: string): Promise<CurriculumSubjectWithDetails | null>;

  abstract findDuplicate(
    curriculumId: string,
    subjectId: string,
    excludeId?: string,
  ): Promise<CurriculumSubject | null>;

  abstract create(data: {
    curriculumId: string;
    subjectId: string;
    hoursPerWeek?: number;
  }): Promise<CurriculumSubjectWithDetails>;

  abstract update(
    id: string,
    data: Prisma.CurriculumSubjectUpdateInput,
  ): Promise<CurriculumSubjectWithDetails>;

  abstract findSoftDeleted(
    curriculumId: string,
    subjectId: string,
  ): Promise<CurriculumSubject | null>;

  abstract restore(
    id: string,
    data: { hoursPerWeek?: number },
  ): Promise<CurriculumSubjectWithDetails>;

  abstract softDelete(id: string): Promise<CurriculumSubject>;
}
