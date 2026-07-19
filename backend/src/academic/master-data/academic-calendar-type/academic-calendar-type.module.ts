import { Module } from '@nestjs/common';
import { AcademicCalendarTypeController } from './presentation/academic-calendar-type.controller.js';
import { PrismaAcademicCalendarTypeRepository } from './infrastructure/persistence/prisma-academic-calendar-type.repository.js';
import { IAcademicCalendarTypeRepository } from './domain/interfaces/academic-calendar-type-repository.interface.js';
import { CreateAcademicCalendarTypeUseCase } from './use-cases/create-academic-calendar-type.use-case.js';
import { DeleteAcademicCalendarTypeUseCase } from './use-cases/delete-academic-calendar-type.use-case.js';
import { GetAcademicCalendarTypeByIdUseCase } from './use-cases/get-academic-calendar-type-by-id.use-case.js';
import { GetAcademicCalendarTypesUseCase } from './use-cases/get-academic-calendar-types.use-case.js';
import { UpdateAcademicCalendarTypeUseCase } from './use-cases/update-academic-calendar-type.use-case.js';

@Module({
  controllers: [AcademicCalendarTypeController],
  providers: [
    {
      provide: IAcademicCalendarTypeRepository,
      useClass: PrismaAcademicCalendarTypeRepository,
    },
    GetAcademicCalendarTypesUseCase,
    GetAcademicCalendarTypeByIdUseCase,
    CreateAcademicCalendarTypeUseCase,
    UpdateAcademicCalendarTypeUseCase,
    DeleteAcademicCalendarTypeUseCase,
  ],
  exports: [IAcademicCalendarTypeRepository],
})
export class AcademicCalendarTypeModule {}
