import { Module } from '@nestjs/common';
import { AcademicYearController } from './presentation/academic-year.controller.js';
import { PrismaAcademicYearRepository } from './infrastructure/persistence/prisma-academic-year.repository.js';
import { ActivateAcademicYearUseCase } from './use-cases/activate-academic-year.use-case.js';
import { CreateAcademicYearUseCase } from './use-cases/create-academic-year.use-case.js';
import { DeactivateAcademicYearUseCase } from './use-cases/deactivate-academic-year.use-case.js';
import { DeleteAcademicYearUseCase } from './use-cases/delete-academic-year.use-case.js';
import { GetAcademicYearByIdUseCase } from './use-cases/get-academic-year-by-id.use-case.js';
import { GetAcademicYearsUseCase } from './use-cases/get-academic-years.use-case.js';
import { UpdateAcademicYearUseCase } from './use-cases/update-academic-year.use-case.js';
import { IAcademicYearRepository } from './domain/interfaces/academic-year-repository.interface.js';

@Module({
  controllers: [AcademicYearController],
  providers: [
    {
      provide: IAcademicYearRepository,
      useClass: PrismaAcademicYearRepository,
    },
    GetAcademicYearsUseCase,
    GetAcademicYearByIdUseCase,
    CreateAcademicYearUseCase,
    UpdateAcademicYearUseCase,
    DeleteAcademicYearUseCase,
    ActivateAcademicYearUseCase,
    DeactivateAcademicYearUseCase,
  ],
  exports: [IAcademicYearRepository],
})
export class AcademicYearModule {}
