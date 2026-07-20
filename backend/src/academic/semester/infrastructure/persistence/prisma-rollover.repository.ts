import { Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IRolloverRepository,
  RolloverSourceData,
  RolloverResult,
  SemesterWithAcademicYear,
} from '../../domain/interfaces/rollover-repository.interface.js';

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

  async executeRollover(
    sourceData: RolloverSourceData,
    targetSemesterId: string,
    targetAcademicYearId: string,
  ): Promise<RolloverResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const result = {
          classrooms: { created: 0, skipped: 0 },
          enrollments: { created: 0, skipped: 0 },
          supervisors: { created: 0, skipped: 0 },
          teachingAssignments: { created: 0, skipped: 0 },
          schedules: { created: 0, skipped: 0 },
        };

        const classroomIdMap = new Map<string, string>();

        for (const classroom of sourceData.classrooms) {
          const existing = await tx.classroom.findFirst({
            where: {
              academicYearId: targetAcademicYearId,
              gradeId: classroom.gradeId,
              code: classroom.code,
              deletedAt: null,
            },
          });

          if (existing) {
            classroomIdMap.set(classroom.id, existing.id);
            result.classrooms.skipped++;
          } else {
            const created = await tx.classroom.create({
              data: {
                academicYearId: targetAcademicYearId,
                gradeId: classroom.gradeId,
                code: classroom.code,
                name: classroom.name,
                capacity: classroom.capacity,
                isActive: classroom.isActive,
              },
            });
            classroomIdMap.set(classroom.id, created.id);
            result.classrooms.created++;
          }
        }

        for (const enrollment of sourceData.enrollments) {
          const newClassroomId = classroomIdMap.get(enrollment.classroomId);
          if (!newClassroomId) continue;

          const existing = await tx.studentEnrollment.findFirst({
            where: {
              studentId: enrollment.studentId,
              semesterId: targetSemesterId,
              deletedAt: null,
            },
          });

          if (existing) {
            result.enrollments.skipped++;
          } else {
            await tx.studentEnrollment.create({
              data: {
                studentId: enrollment.studentId,
                classroomId: newClassroomId,
                semesterId: targetSemesterId,
                status: EnrollmentStatus.ACTIVE,
              },
            });
            result.enrollments.created++;
          }
        }

        for (const supervisor of sourceData.supervisors) {
          const newClassroomId = classroomIdMap.get(supervisor.classroomId);
          if (!newClassroomId) continue;

          const existing = await tx.classroomSupervisor.findFirst({
            where: {
              classroomId: newClassroomId,
              semesterId: targetSemesterId,
              deletedAt: null,
            },
          });

          if (existing) {
            result.supervisors.skipped++;
          } else {
            await tx.classroomSupervisor.create({
              data: {
                classroomId: newClassroomId,
                teacherId: supervisor.teacherId,
                semesterId: targetSemesterId,
              },
            });
            result.supervisors.created++;
          }
        }

        const assignmentIdMap = new Map<string, string>();

        for (const assignment of sourceData.assignments) {
          const newClassroomId = classroomIdMap.get(assignment.classroomId);
          if (!newClassroomId) continue;

          const existing = await tx.teachingAssignment.findFirst({
            where: {
              teacherId: assignment.teacherId,
              classroomId: newClassroomId,
              subjectId: assignment.subjectId,
              semesterId: targetSemesterId,
              deletedAt: null,
            },
          });

          if (existing) {
            assignmentIdMap.set(assignment.id, existing.id);
            result.teachingAssignments.skipped++;
          } else {
            const created = await tx.teachingAssignment.create({
              data: {
                teacherId: assignment.teacherId,
                classroomId: newClassroomId,
                subjectId: assignment.subjectId,
                semesterId: targetSemesterId,
              },
            });
            assignmentIdMap.set(assignment.id, created.id);
            result.teachingAssignments.created++;
          }

          for (const schedule of assignment.schedules) {
            const newAssignmentId = assignmentIdMap.get(assignment.id);
            if (!newAssignmentId) continue;

            const existingSchedule = await tx.schedule.findFirst({
              where: {
                teachingAssignmentId: newAssignmentId,
                day: schedule.day,
                timeSlotId: schedule.timeSlotId,
                deletedAt: null,
              },
            });

            if (existingSchedule) {
              result.schedules.skipped++;
            } else {
              await tx.schedule.create({
                data: {
                  teachingAssignmentId: newAssignmentId,
                  timeSlotId: schedule.timeSlotId,
                  day: schedule.day,
                  room: schedule.room,
                },
              });
              result.schedules.created++;
            }
          }
        }

        return result;
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }
}
