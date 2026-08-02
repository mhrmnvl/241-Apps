import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  StudentScoreQueryInput,
  CreateStudentScoreRepositoryInput,
  UpdateStudentScoreRepositoryInput,
  BulkStudentScoreRecord,
} from '../../domain/interfaces/student-score-repository.interface.js';
import {
  IStudentScoreRepository,
  StudentScoreWithDetails,
  ReportCardScoreRow,
  StudentScoreRosterItem,
} from '../../domain/interfaces/student-score-repository.interface.js';
import {
  STUDENT_SCORE_WITH_DETAILS_INCLUDE as STUDENT_SCORE_INCLUDE,
  REPORT_CARD_SCORE_INCLUDE,
} from './prisma-assessment.includes.js';

@Injectable()
export class PrismaStudentScoreRepository extends IStudentScoreRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: StudentScoreQueryInput) {
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

  async findScore(
    assessmentItemId: string,
    studentEnrollmentId: string,
    excludeId?: string,
  ) {
    return this.prisma.studentScore.findFirst({
      where: {
        assessmentItemId,
        enrollmentId: studentEnrollmentId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
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

  async create(data: CreateStudentScoreRepositoryInput) {
    return this.prisma.studentScore.create({
      data,
      include: STUDENT_SCORE_INCLUDE,
    });
  }

  async update(id: string, data: UpdateStudentScoreRepositoryInput) {
    return this.prisma.studentScore.update({
      where: { id },
      data,
      include: STUDENT_SCORE_INCLUDE,
    });
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

  async restore(id: string, data?: UpdateStudentScoreRepositoryInput) {
    return this.prisma.studentScore.update({
      where: { id },
      data: { ...(data ?? {}), deletedAt: null },
      include: STUDENT_SCORE_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    return this.prisma.studentScore.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRoster(
    assessmentItemId: string,
    classroomId?: string,
    semesterId?: string,
  ): Promise<StudentScoreRosterItem[]> {
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        ...(classroomId && { classroomId }),
        ...(semesterId && { semesterId }),
        deletedAt: null,
      },
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
    records: BulkStudentScoreRecord[],
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
