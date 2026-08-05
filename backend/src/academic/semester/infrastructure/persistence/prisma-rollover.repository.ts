import { Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IRolloverRepository,
  RolloverSourceData,
  RolloverResult,
  SemesterWithAcademicYear,
} from '../../domain/interfaces/rollover-repository.interface.js';
import {
  copyClassrooms,
  copyEnrollments,
  copySupervisors,
  emptyRolloverResult,
} from './prisma-rollover.steps.js';
import { copyAssignmentsWithSchedules } from './prisma-rollover.assignment-step.js';

/** A rollover touches five tables; give it room beyond the default timeout. */
const ROLLOVER_TX_OPTIONS = { maxWait: 10000, timeout: 30000 };

@Injectable()
export class PrismaRolloverRepository extends IRolloverRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findSemesterWithAcademicYear(
    id: string,
  ): Promise<SemesterWithAcademicYear | null> {
    return this.prisma.semester.findFirst({
      where: { id, deletedAt: null },
      include: { academicYear: true },
    });
  }

  async fetchSourceData(
    sourceSemesterId: string,
    sourceAcademicYearId: string,
  ): Promise<RolloverSourceData> {
    const [classrooms, enrollments, supervisors, assignments] =
      await Promise.all([
        this.prisma.classroom.findMany({
          where: { academicYearId: sourceAcademicYearId, deletedAt: null },
        }),
        this.prisma.studentEnrollment.findMany({
          where: {
            semesterId: sourceSemesterId,
            status: EnrollmentStatus.ACTIVE,
            deletedAt: null,
          },
        }),
        this.prisma.classroomSupervisor.findMany({
          where: { semesterId: sourceSemesterId, deletedAt: null },
        }),
        this.prisma.teachingAssignment.findMany({
          where: { semesterId: sourceSemesterId, deletedAt: null },
          include: { schedules: { where: { deletedAt: null } } },
        }),
      ]);

    return { classrooms, enrollments, supervisors, assignments };
  }

  /**
   * Copies one semester's structure onto the next, in dependency order:
   * classrooms first (everything else re-points at them), then enrolments,
   * homeroom teachers, and finally teaching assignments with their schedules.
   */
  async executeRollover(
    sourceData: RolloverSourceData,
    targetSemesterId: string,
    targetAcademicYearId: string,
  ): Promise<RolloverResult> {
    return this.prisma.$transaction(async (tx) => {
      const result = emptyRolloverResult();

      const classroomIdMap = await copyClassrooms(
        tx,
        sourceData.classrooms,
        targetAcademicYearId,
        result,
      );

      await copyEnrollments(
        tx,
        sourceData.enrollments,
        classroomIdMap,
        targetSemesterId,
        result,
      );

      await copySupervisors(
        tx,
        sourceData.supervisors,
        classroomIdMap,
        targetSemesterId,
        result,
      );

      await copyAssignmentsWithSchedules(
        tx,
        sourceData.assignments,
        classroomIdMap,
        targetSemesterId,
        result,
      );

      return result;
    }, ROLLOVER_TX_OPTIONS);
  }
}
