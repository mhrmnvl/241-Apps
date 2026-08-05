import { Injectable } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { AttendanceRecapQueryDto } from '../dto/request/attendance-recap-query.dto.js';

@Injectable()
export class GetAttendanceRecapUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceRecapQueryDto) {
    return this.attendanceRepository.getRecap({
      classroomId: query.classroomId,
      semesterId: query.semesterId,
      month: query.month,
      year: query.year,
    });
  }
}
