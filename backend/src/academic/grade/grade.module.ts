import { Module } from '@nestjs/common';
import { GradesController } from './presentation/grade.controller.js';
import { GradeAcademicYearController } from './presentation/grade-academic-year.controller.js';
import { PrismaGradeRepository } from './infrastructure/persistence/prisma-grade.repository.js';
import { PrismaGradeAcademicYearRepository } from './infrastructure/persistence/prisma-grade-academic-year.repository.js';
import { CreateGradeUseCase } from './use-cases/create-grade.use-case.js';
import { DeleteGradeUseCase } from './use-cases/delete-grade.use-case.js';
import { GetGradeByIdUseCase } from './use-cases/get-grade-by-id.use-case.js';
import { GetGradesUseCase } from './use-cases/get-grades.use-case.js';
import { UpdateGradeUseCase } from './use-cases/update-grade.use-case.js';
import { AssignCurriculumToGradeUseCase } from './use-cases/assign-curriculum-to-grade.use-case.js';
import { GetGradeAcademicYearsUseCase } from './use-cases/get-grade-academic-years.use-case.js';
import { RemoveCurriculumFromGradeUseCase } from './use-cases/remove-curriculum-from-grade.use-case.js';
import { IGradeRepository } from './domain/interfaces/grade-repository.interface.js';
import { IGradeAcademicYearRepository } from './domain/interfaces/grade-academic-year-repository.interface.js';

@Module({
  controllers: [GradesController, GradeAcademicYearController],
  providers: [
    {
      provide: IGradeRepository,
      useClass: PrismaGradeRepository,
    },
    {
      provide: IGradeAcademicYearRepository,
      useClass: PrismaGradeAcademicYearRepository,
    },
    GetGradesUseCase,
    GetGradeByIdUseCase,
    CreateGradeUseCase,
    UpdateGradeUseCase,
    DeleteGradeUseCase,
    AssignCurriculumToGradeUseCase,
    GetGradeAcademicYearsUseCase,
    RemoveCurriculumFromGradeUseCase,
  ],
  exports: [IGradeRepository, IGradeAcademicYearRepository],
})
export class GradeModule {}
