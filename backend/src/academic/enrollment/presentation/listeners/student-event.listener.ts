import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StudentCreatedEvent } from '../../../student/domain/events/student.events.js';
import { CreateStudentEnrollmentUseCase } from '../../use-cases/create-student-enrollment.use-case.js';
import { SemesterRepository } from '../../../semester/repositories/semester.repository.js';

@Injectable()
export class StudentEventListener {
  private readonly logger = new Logger(StudentEventListener.name);

  constructor(
    private readonly createStudentEnrollmentUseCase: CreateStudentEnrollmentUseCase,
    private readonly semesterRepo: SemesterRepository,
  ) {}

  @OnEvent('student.created')
  async handleStudentCreated(event: StudentCreatedEvent) {
    this.logger.log(
      `Handling student.created event for student: ${event.studentId}`,
    );
    if (event.classroomId) {
      try {
        const activeSemester = await this.semesterRepo.findActive();
        if (activeSemester) {
          await this.createStudentEnrollmentUseCase.execute({
            studentId: event.studentId,
            classroomId: event.classroomId,
            semesterId: activeSemester.id,
          });
          this.logger.log(
            `Auto-enrolled student ${event.studentId} to classroom ${event.classroomId} via event`,
          );
        } else {
          this.logger.warn(
            `No active semester found to auto-enroll student ${event.studentId}`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to auto-enroll student ${event.studentId}: ${message}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
