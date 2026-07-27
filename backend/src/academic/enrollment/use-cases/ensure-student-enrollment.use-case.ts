import { Injectable, Logger } from '@nestjs/common';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { SemesterRepository } from '../../semester/repositories/semester.repository.js';
import { CreateStudentEnrollmentUseCase } from './create-student-enrollment.use-case.js';
import { TransferStudentUseCase } from './transfer-student.use-case.js';

/**
 * Idempotently ensures a student is enrolled in a classroom for the active
 * semester: creates a new enrollment, transfers an existing one to the given
 * classroom, or does nothing if it already matches. Callers pass only
 * studentId/classroomId -- this use-case owns the "does an enrollment
 * already exist, and where" check, so it can be called unconditionally from
 * both student creation and bulk-import conflict resolution.
 */
@Injectable()
export class EnsureStudentEnrollmentUseCase {
  private readonly logger = new Logger(EnsureStudentEnrollmentUseCase.name);

  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly semesterRepo: SemesterRepository,
    private readonly createStudentEnrollment: CreateStudentEnrollmentUseCase,
    private readonly transferStudent: TransferStudentUseCase,
  ) {}

  async execute(studentId: string, classroomId: string): Promise<void> {
    const activeSemester = await this.semesterRepo.findActive();
    if (!activeSemester) {
      this.logger.warn(
        `No active semester found; skipping enrollment for student ${studentId}`,
      );
      return;
    }

    const existing = await this.enrollmentRepo.findDuplicate(
      studentId,
      activeSemester.id,
    );

    if (!existing) {
      await this.createStudentEnrollment.execute({
        studentId,
        classroomId,
        semesterId: activeSemester.id,
      });
      this.logger.log(
        `Enrolled student ${studentId} in classroom ${classroomId}`,
      );
      return;
    }

    if (existing.classroomId === classroomId) {
      return;
    }

    await this.transferStudent.execute(existing.id, {
      targetClassroomId: classroomId,
    });
    this.logger.log(
      `Transferred student ${studentId} to classroom ${classroomId}`,
    );
  }
}
