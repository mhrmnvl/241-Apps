import { Module } from '@nestjs/common';
import { AttendanceController } from './presentation/attendance.controller.js';
import { PrismaAttendanceRepository } from './infrastructure/persistence/prisma-attendance.repository.js';
import {
  CreateAttendanceUseCase,
  DeleteAttendanceUseCase,
  GetAttendanceByIdUseCase,
  GetAttendancesUseCase,
  UpdateAttendanceUseCase,
  BulkUpsertAttendanceUseCase,
  GetAttendanceRecapUseCase,
} from './use-cases/attendance.use-case.js';
import { IAttendanceRepository } from './domain/interfaces/attendance-repository.interface.js';

@Module({
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
  ],
  exports: [IAttendanceRepository],
})
export class AttendanceModule {}
