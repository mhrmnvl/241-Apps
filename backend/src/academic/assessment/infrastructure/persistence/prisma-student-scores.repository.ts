import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { StudentScoreQueryDto } from '../../dto/request/student-score-query.dto.js';
import type { BulkStudentScoreRecordDto } from '../../dto/request/bulk-upsert-student-score.dto.js';
import {
  IStudentScoresRepository,
  STUDENT_SCORE_INCLUDE,
  REPORT_CARD_SCORE_INCLUDE,
  StudentScoreRosterItem,
  ReportCardScoreRow,
} from '../../domain/interfaces/student-scores-repository.interface.js';

@Injectable()
export class PrismaStudentScoresRepository extends IStudentScoresRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: StudentScoreQueryDto) {
    const { page = 1, limit = 10, enrollmentId, assessmentItemId } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.StudentScoreWhereInput = {
      deletedAt: null,
      ...(enrollmentId && { enrollmentId }),
      ...(assessmentItemId && { assessmentItemId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.studentScore.findMany({
        where,
        skip,
        take: limit,
        include: STUDENT_SCORE_INCLUDE,
      }),
      this.prisma.studentScore.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.studentScore.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: STUDENT_SCORE_INCLUDE,
    });
  }

  async findAllForReportCard(
    enrollmentId: string,
  ): Promise<ReportCardScoreRow[]> {
    return this.prisma.studentScore.findMany({
      where: { enrollmentId, deletedAt: null },
      include: REPORT_CARD_SCORE_INCLUDE,
    });
  }

  async findDuplicate(
    enrollmentId: string,
    assessmentItemId: string,
    excludeId?: string,
  ) {
    return this.prisma.studentScore.findFirst({
      where: {
        enrollmentId,
        assessmentItemId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: {
    enrollmentId: string;
    assessmentItemId: string;
    score?: number;
    note?: string;
  }) {
    return this.prisma.studentScore.create({ data });
  }

  async update(id: string, data: Prisma.StudentScoreUpdateInput) {
    return this.prisma.studentScore.update({ where: { id }, data });
  }

  async findSoftDeleted(enrollmentId: string, assessmentItemId: string) {
    return this.prisma.studentScore.findFirst({
      where: {
        enrollmentId,
        assessmentItemId,
        deletedAt: { not: null },
      },
    });
  }

  async restore(id: string, data: { score?: number; note?: string }) {
    return this.prisma.studentScore.update({
      where: { id },
      data: { ...data, deletedAt: null },
    });
  }

  async softDelete(id: string) {
    return this.prisma.studentScore.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRoster(
    assessmentItemId: string,
    classroomId: string,
    semesterId: string,
  ): Promise<StudentScoreRosterItem[]> {
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { classroomId, semesterId, deletedAt: null },
      select: {
        id: true,
        student: {
          select: {
            nis: true,
            user: { select: { profile: { select: { name: true } } } },
          },
        },
      },
    });

    const scores = await this.prisma.studentScore.findMany({
      where: {
        assessmentItemId,
        deletedAt: null,
        enrollmentId: { in: enrollments.map((e) => e.id) },
      },
    });
    const scoreMap = new Map(scores.map((s) => [s.enrollmentId, s]));

    return enrollments
      .map((e) => {
        const s = scoreMap.get(e.id);
        return {
          enrollmentId: e.id,
          nis: e.student.nis,
          studentName: e.student.user.profile?.name ?? '-',
          scoreId: s?.id ?? null,
          score: s?.score ?? null,
          note: s?.note ?? null,
        };
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }

  async bulkUpsert(
    assessmentItemId: string,
    records: BulkStudentScoreRecordDto[],
  ) {
    const results = await this.prisma.$transaction(
      records.map((record) =>
        this.prisma.studentScore.upsert({
          where: {
            enrollmentId_assessmentItemId: {
              enrollmentId: record.enrollmentId,
              assessmentItemId,
            },
          },
          update: {
            score: record.score,
            note: record.note,
            deletedAt: null,
          },
          create: {
            enrollmentId: record.enrollmentId,
            assessmentItemId,
            score: record.score,
            note: record.note,
          },
        }),
      ),
    );
    return { saved: results.length };
  }
}
