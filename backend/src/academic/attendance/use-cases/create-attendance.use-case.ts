import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { CreateAttendanceDto } from '../dto/request/attendance.dto.js';

@Injectable()
export class CreateAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: CreateAttendanceDto) {
    const enrollment = await this.enrollmentRepository.findById(
      dto.enrollmentId,
    );
    if (enrollment?.status !== 'ACTIVE') {
      throw new BadRequestException('Enrollment not found or is not active');
    }

    const dup = await this.attendanceRepository.findDuplicate(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (dup)
      throw new ConflictException('Attendance already recorded for this date');

    const softDeleted = await this.attendanceRepository.findSoftDeleted(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (softDeleted) {
      return this.attendanceRepository.restore(softDeleted.id, {
        status: dto.status,
        note: dto.note,
      });
    }

    return this.attendanceRepository.create({
      ...dto,
      date: new Date(dto.date),
    });
  }
}
