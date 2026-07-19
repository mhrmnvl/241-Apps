import { Module } from '@nestjs/common';
import { SemesterModule } from '../semester/semester.module.js';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { ScheduleController } from './presentation/schedule.controller.js';
import { TimeSlotController } from './presentation/time-slot.controller.js';
import { PrismaScheduleRepository } from './infrastructure/persistence/prisma-schedule.repository.js';
import { PrismaTimeSlotRepository } from './infrastructure/persistence/prisma-time-slot.repository.js';
import { IScheduleRepository } from './domain/interfaces/schedule-repository.interface.js';
import { ITimeSlotRepository } from './domain/interfaces/time-slot-repository.interface.js';

import {
  CreateScheduleUseCase,
  DeleteScheduleUseCase,
  GetScheduleByIdUseCase,
  GetSchedulesUseCase,
  UpdateScheduleUseCase,
  BatchUpsertScheduleUseCase,
  GetSchedulesByClassroomUseCase,
} from './use-cases/schedule.use-case.js';

import { CreateTimeSlotUseCase } from './use-cases/create-time-slot.use-case.js';
import { DeleteTimeSlotUseCase } from './use-cases/delete-time-slot.use-case.js';
import { GetTimeSlotByIdUseCase } from './use-cases/get-time-slot-by-id.use-case.js';
import { GetTimeSlotsUseCase } from './use-cases/get-time-slots.use-case.js';
import { UpdateTimeSlotUseCase } from './use-cases/update-time-slot.use-case.js';

@Module({
  imports: [SemesterModule, TeachingAssignmentModule, ClassroomModule],
  controllers: [ScheduleController, TimeSlotController],
  providers: [
    {
      provide: IScheduleRepository,
      useClass: PrismaScheduleRepository,
    },
    {
      provide: ITimeSlotRepository,
      useClass: PrismaTimeSlotRepository,
    },

    GetSchedulesUseCase,
    GetScheduleByIdUseCase,
    GetSchedulesByClassroomUseCase,
    CreateScheduleUseCase,
    UpdateScheduleUseCase,
    DeleteScheduleUseCase,
    BatchUpsertScheduleUseCase,

    GetTimeSlotsUseCase,
    GetTimeSlotByIdUseCase,
    CreateTimeSlotUseCase,
    UpdateTimeSlotUseCase,
    DeleteTimeSlotUseCase,
  ],
  exports: [IScheduleRepository, ITimeSlotRepository],
})
export class ScheduleModule {}
