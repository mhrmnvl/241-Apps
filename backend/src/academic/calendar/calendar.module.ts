import { Module } from '@nestjs/common';
import { AcademicYearModule } from '../academic-year/academic-year.module.js';
import { SemesterModule } from '../semester/semester.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { AcademicCalendarController } from './presentation/academic-calendar.controller.js';
import { PrismaAcademicCalendarRepository } from './infrastructure/persistence/prisma-academic-calendar.repository.js';
import { IAcademicCalendarRepository } from './domain/interfaces/academic-calendar-repository.interface.js';

import { CreateAcademicCalendarUseCase } from './use-cases/create-academic-calendar.use-case.js';
import { DeleteAcademicCalendarUseCase } from './use-cases/delete-academic-calendar.use-case.js';
import { GetAcademicCalendarByIdUseCase } from './use-cases/get-academic-calendar-by-id.use-case.js';
import { GetAcademicCalendarsUseCase } from './use-cases/get-academic-calendars.use-case.js';
import { UpdateAcademicCalendarUseCase } from './use-cases/update-academic-calendar.use-case.js';

@Module({
  imports: [AcademicYearModule, SemesterModule, ClassroomModule],
  controllers: [AcademicCalendarController],
  providers: [
    {
      provide: IAcademicCalendarRepository,
      useClass: PrismaAcademicCalendarRepository,
    },
    GetAcademicCalendarsUseCase,
    GetAcademicCalendarByIdUseCase,
    CreateAcademicCalendarUseCase,
    UpdateAcademicCalendarUseCase,
    DeleteAcademicCalendarUseCase,
  ],
})
export class CalendarModule {}
