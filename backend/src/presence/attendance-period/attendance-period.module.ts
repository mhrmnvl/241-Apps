import { Module } from '@nestjs/common';
import { IAttendancePeriodRepository } from './domain/interfaces/attendance-period-repository.interface.js';
import { PrismaAttendancePeriodRepository } from './infrastructure/persistence/prisma-attendance-period.repository.js';
import { AttendancePeriodController } from './presentation/attendance-period.controller.js';
import { CloseAttendancePeriodUseCase } from './use-cases/close-attendance-period.use-case.js';
import { GetAttendancePeriodsUseCase } from './use-cases/get-attendance-periods.use-case.js';

/**
 * Exports the port because three other modules ask it whether a month is
 * closed — daily-record before accepting a correction, work-pattern when
 * closing, and payroll before running.
 */
@Module({
  controllers: [AttendancePeriodController],
  providers: [
    {
      provide: IAttendancePeriodRepository,
      useClass: PrismaAttendancePeriodRepository,
    },
    GetAttendancePeriodsUseCase,
    CloseAttendancePeriodUseCase,
  ],
  exports: [IAttendancePeriodRepository, GetAttendancePeriodsUseCase],
})
export class AttendancePeriodModule {}
