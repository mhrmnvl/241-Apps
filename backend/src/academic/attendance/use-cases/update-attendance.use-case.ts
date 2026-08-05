import { Injectable, NotFoundException } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import { UpdateAttendanceDto } from '../dto/request/update-attendance.dto.js';

@Injectable()
export class UpdateAttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(id: string, dto: UpdateAttendanceDto) {
    const r = await this.attendanceRepository.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    // The enrolment, date and schedule identify the row and cannot be edited.
    return this.attendanceRepository.update(id, {
      status: dto.status,
      note: dto.note,
    });
  }
}
