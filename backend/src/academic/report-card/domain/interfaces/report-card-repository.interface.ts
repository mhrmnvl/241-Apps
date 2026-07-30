import { Prisma, ReportCard } from '@prisma/client';
import { ReportCardQueryDto } from '../../dto/request/report-card-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const RAPOR_INCLUDE = {
  enrollment: {
    include: {
      student: {
        include: {
          user: { include: { profile: { select: { name: true } } } },
        },
      },
      classroom: {
        select: {
          id: true,
          code: true,
          name: true,
          grade: { select: { name: true } },
        },
      },
      semester: {
        select: {
          id: true,
          type: true,
          academicYear: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.ReportCardInclude;

export type ReportCardWithDetails = Prisma.ReportCardGetPayload<{
  include: typeof RAPOR_INCLUDE;
}>;

export interface UpsertReportCardRepositoryInput {
  enrollmentId: string;
  totalAverage: number | null;
  rank?: number | null;
  teacherNote?: string | null;
  isPublished?: boolean;
}

export interface UpdateReportCardRepositoryInput {
  teacherNote?: string | null;
  rank?: number | null;
  isPublished?: boolean;
}

export abstract class IReportCardRepository {
  abstract findAll(
    query: ReportCardQueryDto,
  ): Promise<PaginatedResult<ReportCardWithDetails>>;
  abstract findById(id: string): Promise<ReportCardWithDetails | null>;
  abstract findByEnrollmentId(
    enrollmentId: string,
  ): Promise<ReportCardWithDetails | null>;
  abstract upsert(
    data: UpsertReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails>;
  abstract update(
    id: string,
    data: UpdateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails>;
  abstract calculateAndApplyClassroomRanks(
    classroomId: string,
    semesterId: string,
    targetEnrollmentId: string,
  ): Promise<number | null>;
  abstract softDelete(id: string): Promise<ReportCard>;
}
