import { Injectable } from '@nestjs/common';
import { AttendancePeriodEntity } from '../domain/entities/attendance-period.entity.js';
import {
  AttendancePeriodQueryInput,
  IAttendancePeriodRepository,
} from '../domain/interfaces/attendance-period-repository.interface.js';

@Injectable()
export class GetAttendancePeriodsUseCase {
  constructor(private readonly repository: IAttendancePeriodRepository) {}

  async execute(
    query: AttendancePeriodQueryInput,
  ): Promise<AttendancePeriodEntity[]> {
    return this.repository.findAll(query);
  }
}
