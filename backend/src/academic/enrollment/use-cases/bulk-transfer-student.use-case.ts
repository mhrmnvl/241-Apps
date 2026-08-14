import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EnrollmentStatus } from '../domain/interfaces/enrollment-repository.interface.js';
import { BulkTransferStudentDto } from '../dto/request/bulk-transfer-student.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { ClassroomCapacityService } from '../services/classroom-capacity.service.js';

@Injectable()
export class BulkTransferStudentUseCase {
  private readonly logger = new Logger(BulkTransferStudentUseCase.name);

  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly classroomCapacity: ClassroomCapacityService,
  ) {}

  async execute(dto: BulkTransferStudentDto) {
    const results: { id: string; success: boolean; error?: string }[] = [];
    const transferable: { id: string; semesterId: string; moving: boolean }[] =
      [];

    // Resolve every enrollment first. A transfer is one intention, so the
    // destination is checked against the whole batch before any student moves:
    // half a transfer leaves a class list that matches neither the old
    // arrangement nor the new one.
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

      transferable.push({
        id: enrollmentId,
        semesterId: enrollment.semesterId,
        // Already in the target classroom: counted as staying, not arriving.
        moving: enrollment.classroomId !== dto.targetClassroomId,
      });
    }

    const semesterIds = new Set(transferable.map((t) => t.semesterId));
    if (semesterIds.size > 1) {
      throw new BadRequestException(
        'Cannot transfer enrollments from more than one semester at a time',
      );
    }

    const [semesterId] = [...semesterIds];
    if (semesterId) {
      await this.classroomCapacity.assertRoomFor({
        classroomId: dto.targetClassroomId,
        semesterId,
        incoming: transferable.filter((t) => t.moving).length,
      });
    }

    for (const { id } of transferable) {
      await this.enrollmentRepository.update(id, {
        classroomId: dto.targetClassroomId,
        note: dto.note,
      });
      results.push({ id, success: true });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    this.logger.log(
      `Bulk transfer: ${successCount} success, ${failCount} failed to classroom ${dto.targetClassroomId}`,
    );

    return { results, successCount, failCount };
  }
}
