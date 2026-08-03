import { BadRequestException, Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { BulkUpsertAttendanceDto } from '../dto/request/bulk-upsert-attendance.dto.js';

@Injectable()
export class BulkUpsertAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: BulkUpsertAttendanceDto) {
    const enrollmentIds = dto.records.map((r) => r.enrollmentId);
    if (enrollmentIds.length > 0) {
      const count =
        await this.enrollmentRepository.countActiveByIds(enrollmentIds);
      if (count !== enrollmentIds.length) {
        throw new BadRequestException(
          'Some enrollments were not found or are not active',
        );
      }
    }
    return this.attendanceRepository.bulkUpsert(
      new Date(dto.date),
      dto.records,
      dto.scheduleId,
    );
  }
}
