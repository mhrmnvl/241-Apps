import { Module } from '@nestjs/common';
import { AcademicYearModule } from '../academic-year/academic-year.module.js';
import { SemesterModule } from '../semester/semester.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { AcademicCalendarController } from './presentation/academic-calendar.controller.js';
import { EventsController } from './presentation/events.controller.js';
import { AudienceGroupsController } from './presentation/audience-groups.controller.js';
import { PrismaAcademicCalendarRepository } from './infrastructure/persistence/prisma-academic-calendar.repository.js';
import { PrismaEventsRepository } from './infrastructure/persistence/prisma-events.repository.js';
import { IAcademicCalendarRepository } from './domain/interfaces/academic-calendar-repository.interface.js';
import { IEventsRepository } from './domain/interfaces/events-repository.interface.js';

import { CreateAcademicCalendarUseCase } from './use-cases/create-academic-calendar.use-case.js';
import { DeleteAcademicCalendarUseCase } from './use-cases/delete-academic-calendar.use-case.js';
import { GetAcademicCalendarByIdUseCase } from './use-cases/get-academic-calendar-by-id.use-case.js';
import { GetAcademicCalendarsUseCase } from './use-cases/get-academic-calendars.use-case.js';
import { UpdateAcademicCalendarUseCase } from './use-cases/update-academic-calendar.use-case.js';

import { CreateEventUseCase } from './use-cases/create-event.use-case.js';
import { DeleteEventUseCase } from './use-cases/delete-event.use-case.js';
import { GetEventByIdUseCase } from './use-cases/get-event-by-id.use-case.js';
import { GetEventsUseCase } from './use-cases/get-events.use-case.js';
import { UpdateEventUseCase } from './use-cases/update-event.use-case.js';

@Module({
  imports: [AcademicYearModule, SemesterModule, ClassroomModule],
  controllers: [
    AcademicCalendarController,
    EventsController,
    AudienceGroupsController,
  ],
  providers: [
    {
      provide: IAcademicCalendarRepository,
      useClass: PrismaAcademicCalendarRepository,
    },
    {
      provide: IEventsRepository,
      useClass: PrismaEventsRepository,
    },

    GetAcademicCalendarsUseCase,
    GetAcademicCalendarByIdUseCase,
    CreateAcademicCalendarUseCase,
    UpdateAcademicCalendarUseCase,
    DeleteAcademicCalendarUseCase,

    GetEventsUseCase,
    GetEventByIdUseCase,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
  ],
  exports: [IAcademicCalendarRepository, IEventsRepository],
})
export class CalendarModule {}
