import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  EnrollmentStatus,
  IEnrollmentRepository,
} from '../domain/interfaces/enrollment-repository.interface.js';
import { TransferStudentDto } from '../dto/request/transfer-student.dto.js';

@Injectable()
export class TransferStudentUseCase {
  private readonly logger = new Logger(TransferStudentUseCase.name);

  constructor(private readonly enrollmentRepository: IEnrollmentRepository) {}

  async execute(enrollmentId: string, dto: TransferStudentDto) {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(
        `StudentEnrollment ${enrollmentId} not found`,
      );
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot transfer: enrollment status is ${enrollment.status}`,
      );
    }

    const updated = await this.enrollmentRepository.update(enrollmentId, {
      classroomId: dto.targetClassroomId,
      note: dto.note,
    });

    this.logger.log(
      `Transferred enrollment ${enrollmentId} to classroom ${dto.targetClassroomId}`,
    );

    return updated;
  }
}
