import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IGradingScopeReadPort } from '../../domain/interfaces/grading-scope-read.port.js';

/**
 * Both questions answered by existence, not by fetching a row to inspect.
 *
 * `findFirst({ select: { id: true } })` is enough: the caller only needs to
 * know whether the reach exists, and reading more would invite a later change
 * to branch on something else it happened to have.
 */
@Injectable()
export class PrismaGradingScopeReadPort extends IGradingScopeReadPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async teachesAssessmentItem(
    teacherId: string,
    assessmentItemId: string,
  ): Promise<boolean> {
    const found = await this.prisma.assessmentItem.findFirst({
      where: {
        id: assessmentItemId,
        deletedAt: null,
        teachingAssignment: { teacherId, deletedAt: null },
      },
      select: { id: true },
    });
    return found !== null;
  }

  async supervisesEnrollment(
    teacherId: string,
    enrollmentId: string,
  ): Promise<boolean> {
    const enrolment = await this.prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, deletedAt: null },
      select: { classroomId: true, semesterId: true },
    });
    if (!enrolment) return false;

    // Supervision is per classroom *per semester*: last year's homeroom
    // teacher must not reach this year's marks.
    const supervisor = await this.prisma.classroomSupervisor.findFirst({
      where: {
        teacherId,
        classroomId: enrolment.classroomId,
        semesterId: enrolment.semesterId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return supervisor !== null;
  }
}
