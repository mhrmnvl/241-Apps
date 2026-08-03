import { Injectable } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { AttendanceQueryDto } from '../dto/request/attendance-query.dto.js';

@Injectable()
export class GetAttendancesUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceQueryDto) {
    return this.attendanceRepository.findAll(query);
  }
}
