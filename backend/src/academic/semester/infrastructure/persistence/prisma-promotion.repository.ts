import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IPromotionRepository,
  StudentPromotionInput,
  PromotionResult,
} from '../../domain/interfaces/promotion-repository.interface.js';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';
import { moveStudentToTargetSemester } from './prisma-promotion.steps.js';

/** A promotion walks every student in the year; allow a generous timeout. */
const PROMOTION_TX_OPTIONS = { maxWait: 10000, timeout: 60000 };

@Injectable()
export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSemesterWithAcademicYear(id: string) {
    return this.prisma.semester.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        type: true,
        academicYearId: true,
        academicYear: { select: { id: true, name: true } },
      },
    });
  }

  async findClassroomById(id: string) {
    return this.prisma.classroom.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        code: true,
        name: true,
        gradeId: true,
        grade: { select: { level: true, name: true } },
        academicYearId: true,
      },
    });
  }

  async findActiveEnrollmentsWithDetails(semesterId: string) {
    return this.prisma.studentEnrollment.findMany({
      where: {
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
        student: { status: StudentStatus.ACTIVE, deletedAt: null },
      },
      select: {
        id: true,
        studentId: true,
        classroomId: true,
        student: {
          select: {
            id: true,
            nis: true,
            user: {
              select: {
                profile: {
                  select: { name: true },
                },
              },
            },
          },
        },
        classroom: {
          select: {
            id: true,
            code: true,
            name: true,
            gradeId: true,
            grade: { select: { level: true, name: true } },
          },
        },
        reportCard: {
          select: { totalAverage: true },
        },
      },
      orderBy: [
        { classroom: { grade: { level: 'asc' } } },
        { classroom: { code: 'asc' } },
        { student: { user: { profile: { name: 'asc' } } } },
      ],
    });
  }

  async findClassesByAcademicYear(academicYearId: string) {
    return this.prisma.classroom.findMany({
      where: { academicYearId, deletedAt: null },
      select: {
        id: true,
        code: true,
        name: true,
        gradeId: true,
        grade: { select: { level: true, name: true } },
        academicYearId: true,
      },
      orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
    });
  }

  async executePromotion(
    sourceSemesterId: string,
    targetSemesterId: string,
    students: StudentPromotionInput[],
  ): Promise<PromotionResult> {
    return this.prisma.$transaction(async (tx) => {
      const result: PromotionResult = {
        promoted: 0,
        repeated: 0,
        skipped: 0,
      };

      for (const student of students) {
        const enrollment = await tx.studentEnrollment.findFirst({
          where: {
            studentId: student.studentId,
            semesterId: sourceSemesterId,
            classroomId: student.sourceClassroomId,
            status: EnrollmentStatus.ACTIVE,
            deletedAt: null,
          },
          select: { id: true, studentId: true },
        });

        // Nothing active to move — the row was already processed or withdrawn.
        if (!enrollment) {
          result.skipped++;
          continue;
        }

        // PROMOTE and REPEAT differ only in the status stamped on the closed
        // row and which counter is bumped; both move the student into the new
        // year. Graduation is not handled here — see Kelulusan.
        await moveStudentToTargetSemester(
          tx,
          enrollment,
          student,
          targetSemesterId,
          result,
        );
      }

      return result;
    }, PROMOTION_TX_OPTIONS);
  }
}
