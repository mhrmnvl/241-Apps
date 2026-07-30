import { Injectable, NotFoundException } from '@nestjs/common';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';

@Injectable()
export class DeleteAttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(id: string) {
    const r = await this.attendanceRepository.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return this.attendanceRepository.softDelete(id);
  }
}
