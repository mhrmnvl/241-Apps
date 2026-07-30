import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  EnrollmentStatus,
  IEnrollmentRepository,
  StudentStatus,
} from '../domain/interfaces/enrollment-repository.interface.js';
import { DropStudentDto } from '../dto/request/drop-student.dto.js';
import { IStudentRepository } from '../../student/domain/interfaces/student-repository.interface.js';

@Injectable()
export class DropStudentUseCase {
  private readonly logger = new Logger(DropStudentUseCase.name);

  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(enrollmentId: string, dto: DropStudentDto) {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(
        `StudentEnrollment ${enrollmentId} not found`,
      );
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot drop: enrollment status is ${enrollment.status}`,
      );
    }

    const updated = await this.enrollmentRepository.update(enrollmentId, {
      status: EnrollmentStatus.DROPPED,
      endedAt: new Date(),
      ...(dto.note && { note: dto.note }),
    });

    if (enrollment.studentId) {
      await this.studentRepository.updateStatus(
        enrollment.studentId,
        StudentStatus.DROPPED,
      );
    }

    this.logger.log(`Dropped enrollment ${enrollmentId}`);

    return updated;
  }
}
