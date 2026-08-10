import { Module } from '@nestjs/common';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
// The `.module.js` directly, never the barrel: a DTO reaching a barrel closes an
// ESM cycle and crashes boot (CLAUDE.md).
import { DailyRecordModule } from '../../presence/daily-record/daily-record.module.js';
import { AttendanceController } from './presentation/attendance.controller.js';
import { PrismaAttendanceRepository } from './infrastructure/persistence/prisma-attendance.repository.js';
import { GetAttendancesUseCase } from './use-cases/get-attendances.use-case.js';
import { GetAttendanceByIdUseCase } from './use-cases/get-attendance-by-id.use-case.js';
import { CreateAttendanceUseCase } from './use-cases/create-attendance.use-case.js';
import { UpdateAttendanceUseCase } from './use-cases/update-attendance.use-case.js';
import { DeleteAttendanceUseCase } from './use-cases/delete-attendance.use-case.js';
import { BulkUpsertAttendanceUseCase } from './use-cases/bulk-upsert-attendance.use-case.js';
import { GetAttendanceRecapUseCase } from './use-cases/get-attendance-recap.use-case.js';
import { GetAttendanceTrendUseCase } from './use-cases/get-attendance-trend.use-case.js';
import { GetAttendanceSuggestionsUseCase } from './use-cases/get-attendance-suggestions.use-case.js';
import { IAttendanceRepository } from './domain/interfaces/attendance-repository.interface.js';

@Module({
  imports: [EnrollmentModule, DailyRecordModule],
  controllers: [AttendanceController],
  providers: [
    {
      provide: IAttendanceRepository,
      useClass: PrismaAttendanceRepository,
    },
    GetAttendancesUseCase,
    GetAttendanceByIdUseCase,
    CreateAttendanceUseCase,
    UpdateAttendanceUseCase,
    DeleteAttendanceUseCase,
    BulkUpsertAttendanceUseCase,
    GetAttendanceRecapUseCase,
    GetAttendanceTrendUseCase,
    GetAttendanceSuggestionsUseCase,
  ],
  exports: [IAttendanceRepository],
})
export class AttendanceModule {}
