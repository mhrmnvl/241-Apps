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

import { GetSchedulesUseCase } from './use-cases/get-schedules.use-case.js';
import { GetScheduleByIdUseCase } from './use-cases/get-schedule-by-id.use-case.js';
import { GetSchedulesByClassroomUseCase } from './use-cases/get-schedules-by-classroom.use-case.js';
import { CreateScheduleUseCase } from './use-cases/create-schedule.use-case.js';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.use-case.js';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.use-case.js';
import { BatchUpsertScheduleUseCase } from './use-cases/batch-upsert-schedule.use-case.js';

import { CreateTimeSlotUseCase } from './use-cases/create-time-slot.use-case.js';
import { DeleteTimeSlotUseCase } from './use-cases/delete-time-slot.use-case.js';
import { GetTimeSlotByIdUseCase } from './use-cases/get-time-slot-by-id.use-case.js';
import { GetTimeSlotsUseCase } from './use-cases/get-time-slots.use-case.js';
import { GetTimeSlotTypesUseCase } from './use-cases/get-time-slot-types.use-case.js';
import { UpdateTimeSlotUseCase } from './use-cases/update-time-slot.use-case.js';
import { CreateTimeSlotTypeUseCase } from './use-cases/create-time-slot-type.use-case.js';
import { UpdateTimeSlotTypeUseCase } from './use-cases/update-time-slot-type.use-case.js';
import { DeleteTimeSlotTypeUseCase } from './use-cases/delete-time-slot-type.use-case.js';

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
    GetTimeSlotTypesUseCase,
    GetTimeSlotByIdUseCase,
    CreateTimeSlotUseCase,
    UpdateTimeSlotUseCase,
    DeleteTimeSlotUseCase,
    CreateTimeSlotTypeUseCase,
    UpdateTimeSlotTypeUseCase,
    DeleteTimeSlotTypeUseCase,
  ],
  exports: [IScheduleRepository, ITimeSlotRepository],
})
export class ScheduleModule {}
