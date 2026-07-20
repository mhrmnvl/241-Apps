import { GradeAcademicYear, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const GRADE_AY_INCLUDE = {
  grade: true,
  academicYear: true,
  curricula: true,
} satisfies Prisma.GradeAcademicYearInclude;

export type GradeAcademicYearWithDetails = Prisma.GradeAcademicYearGetPayload<{
  include: typeof GRADE_AY_INCLUDE;
}>;

export abstract class IGradeAcademicYearRepository {
  abstract findAll(
    academicYearId?: string,
  ): Promise<GradeAcademicYearWithDetails[]>;
  abstract findByGradeAndYear(
    gradeId: string,
    academicYearId: string,
  ): Promise<GradeAcademicYear | null>;
  abstract upsert(data: {
    gradeId: string;
    academicYearId: string;
    curriculumId: string;
  }): Promise<GradeAcademicYearWithDetails>;
  abstract delete(id: string): Promise<void>;
}
