import { Injectable } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { AttendanceTrendQueryDto } from '../dto/request/attendance.dto.js';

@Injectable()
export class GetAttendanceTrendUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceTrendQueryDto) {
    return this.attendanceRepository.getMonthlyTrend(query);
  }
}
