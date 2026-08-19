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
import {
  buildScoreRoster,
  upsertScores,
} from './prisma-student-score.roster.js';

@Injectable()
export class PrismaStudentScoreRepository extends IStudentScoreRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: StudentScoreQueryInput) {
    const {
      page = 1,
      limit = 10,
      enrollmentId,
      assessmentItemId,
      classroomId,
      semesterId,
      studentId,
    } = query;
    const skip = (page - 1) * limit;

    // `classroomId` and `semesterId` were declared on the port and dropped
    // here, so a caller filtering by either got every score and no error. They
    // are honoured now, alongside `studentId`, which reaches the person through
    // the enrolment their scores hang off.
    const enrollment: Prisma.StudentEnrollmentWhereInput = {
      ...(classroomId && { classroomId }),
      ...(semesterId && { semesterId }),
      ...(studentId && { studentId }),
    };

    const where: Prisma.StudentScoreWhereInput = {
      deletedAt: null,
      ...(enrollmentId && { enrollmentId }),
      ...(assessmentItemId && { assessmentItemId }),
      ...(Object.keys(enrollment).length > 0 && { enrollment }),
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
    return buildScoreRoster(
      this.prisma,
      assessmentItemId,
      classroomId,
      semesterId,
    );
  }

  async bulkUpsert(
    assessmentItemId: string,
    records: BulkStudentScoreRecord[],
    correctedById: string | null = null,
  ) {
    return upsertScores(this.prisma, assessmentItemId, records, correctedById);
  }
}
