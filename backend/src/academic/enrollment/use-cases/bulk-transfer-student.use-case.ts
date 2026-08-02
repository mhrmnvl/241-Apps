import { Injectable, Logger } from '@nestjs/common';
import { EnrollmentStatus } from '../domain/interfaces/enrollment-repository.interface.js';
import { BulkTransferStudentDto } from '../dto/request/bulk-transfer-student.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class BulkTransferStudentUseCase {
  private readonly logger = new Logger(BulkTransferStudentUseCase.name);

  constructor(private readonly enrollmentRepository: IEnrollmentRepository) {}

  async execute(dto: BulkTransferStudentDto) {
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const enrollmentId of dto.enrollmentIds) {
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      if (!enrollment) {
        results.push({
          id: enrollmentId,
          success: false,
          error: `Enrollment ${enrollmentId} not found`,
        });
        continue;
      }

      if (enrollment.status !== EnrollmentStatus.ACTIVE) {
        results.push({
          id: enrollmentId,
          success: false,
          error: `Cannot transfer: status is ${enrollment.status}`,
        });
        continue;
      }

      await this.enrollmentRepository.update(enrollmentId, {
        classroomId: dto.targetClassroomId,
        note: dto.note,
      });

      results.push({ id: enrollmentId, success: true });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    this.logger.log(
      `Bulk transfer: ${successCount} success, ${failCount} failed to classroom ${dto.targetClassroomId}`,
    );

    return { results, successCount, failCount };
  }
}
