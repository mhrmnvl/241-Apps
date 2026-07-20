import { StudentScore, Prisma } from '@prisma/client';
import type { StudentScoreQueryDto } from '../../dto/request/student-score-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const STUDENT_SCORE_INCLUDE = {
  enrollment: {
    include: {
      student: { include: { user: { select: { profile: true } } } },
    },
  },
  assessmentItem: true,
} satisfies Prisma.StudentScoreInclude;

export type StudentScoreWithDetails = Prisma.StudentScoreGetPayload<{
  include: typeof STUDENT_SCORE_INCLUDE;
}>;

export abstract class IStudentScoresRepository {
  abstract findAll(
    query: StudentScoreQueryDto,
  ): Promise<PaginatedResult<StudentScoreWithDetails>>;

  abstract findById(id: string): Promise<StudentScoreWithDetails | null>;

  abstract findDuplicate(
    enrollmentId: string,
    assessmentItemId: string,
    excludeId?: string,
  ): Promise<StudentScore | null>;

  abstract create(data: {
    enrollmentId: string;
    assessmentItemId: string;
    score?: number;
    note?: string;
  }): Promise<StudentScore>;

  abstract update(
    id: string,
    data: Prisma.StudentScoreUpdateInput,
  ): Promise<StudentScore>;

  abstract findSoftDeleted(
    enrollmentId: string,
    assessmentItemId: string,
  ): Promise<StudentScore | null>;

  abstract restore(
    id: string,
    data: { score?: number; note?: string },
  ): Promise<StudentScore>;

  abstract softDelete(id: string): Promise<StudentScore>;
}
