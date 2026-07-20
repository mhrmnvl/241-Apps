import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { DropStudentDto } from '../dto/request/drop-student.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class DropStudentUseCase {
  private readonly logger = new Logger(DropStudentUseCase.name);

  constructor(private readonly repo: IEnrollmentRepository) {}

  async execute(enrollmentId: string, dto: DropStudentDto) {
    const enrollment = await this.repo.findById(enrollmentId);
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

    const updated = await this.repo.update(enrollmentId, {
      status: EnrollmentStatus.DROPPED,
      endedAt: new Date(),
      ...(dto.note && { note: dto.note }),
    });

    this.logger.log(`Dropped enrollment ${enrollmentId}`);

    return updated;
  }
}
