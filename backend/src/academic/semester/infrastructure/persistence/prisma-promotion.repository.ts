import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IPromotionRepository,
  StudentPromotionInput,
  PromotionResult,
} from '../../domain/interfaces/promotion-repository.interface.js';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';

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
    return this.prisma.$transaction(
      async (tx) => {
        const result = {
          promoted: 0,
          repeated: 0,
          graduated: 0,
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

          if (!enrollment) {
            result.skipped++;
            continue;
          }

          if (student.action === PromotionAction.GRADUATE) {
            const existingGraduation = await tx.studentGraduation.findUnique({
              where: { studentId: enrollment.studentId },
            });

            if (existingGraduation) {
              result.skipped++;
              continue;
            }

            await tx.studentEnrollment.update({
              where: { id: enrollment.id },
              data: {
                status: EnrollmentStatus.GRADUATED,
                endedAt: new Date(),
                note: student.declineReason ?? null,
              },
            });

            await tx.student.update({
              where: { id: enrollment.studentId },
              data: { status: StudentStatus.GRADUATED },
            });

            const targetSemester = await tx.semester.findFirstOrThrow({
              where: { id: targetSemesterId },
              select: { academicYearId: true },
            });

            await tx.studentGraduation.create({
              data: {
                studentId: enrollment.studentId,
                academicYearId: targetSemester.academicYearId,
                graduationDate: new Date(),
              },
            });

            result.graduated++;
          } else {
            const existingEnrollment = await tx.studentEnrollment.findFirst({
              where: {
                studentId: enrollment.studentId,
                semesterId: targetSemesterId,
                deletedAt: null,
              },
            });

            if (existingEnrollment) {
              result.skipped++;
              continue;
            }

            const newStatus =
              student.action === PromotionAction.PROMOTE
                ? EnrollmentStatus.PROMOTED
                : EnrollmentStatus.REPEATED;

            await tx.studentEnrollment.update({
              where: { id: enrollment.id },
              data: {
                status: newStatus,
                endedAt: new Date(),
                note: student.declineReason ?? null,
              },
            });

            await tx.studentEnrollment.create({
              data: {
                studentId: enrollment.studentId,
                classroomId: student.targetClassroomId!,
                semesterId: targetSemesterId,
                status: EnrollmentStatus.ACTIVE,
              },
            });

            // Keep Student.gradeId in sync with the classroom they've been
            // promoted/repeated into, so the "Tingkat" filter in the student
            // list reflects the current grade level without relying on
            // enrollment-based fallback.
            const targetClassroom = await tx.classroom.findFirst({
              where: { id: student.targetClassroomId! },
              select: { gradeId: true },
            });
            if (targetClassroom) {
              await tx.student.update({
                where: { id: enrollment.studentId },
                data: { gradeId: targetClassroom.gradeId },
              });
            }

            if (student.action === PromotionAction.PROMOTE) {
              result.promoted++;
            } else {
              result.repeated++;
            }
          }
        }

        return result;
      },
      { maxWait: 10000, timeout: 60000 },
    );
  }
}
