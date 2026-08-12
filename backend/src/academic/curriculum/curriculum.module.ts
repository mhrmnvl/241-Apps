import { Module } from '@nestjs/common';
import { AcademicYearModule } from '../academic-year/academic-year.module.js';
import { CurriculumController } from './presentation/curriculum.controller.js';
import { CurriculumSubjectController } from './presentation/curriculum-subject.controller.js';
import { PrismaCurriculumRepository } from './infrastructure/persistence/prisma-curriculum.repository.js';
import { PrismaCurriculumSubjectRepository } from './infrastructure/persistence/prisma-curriculum-subject.repository.js';

import { CreateCurriculaUseCase } from './use-cases/create-curriculum.use-case.js';
import { DeleteCurriculaUseCase } from './use-cases/delete-curriculum.use-case.js';
import { GetCurriculaByIdUseCase } from './use-cases/get-curricula-by-id.use-case.js';
import { GetCurriculaUseCase } from './use-cases/get-curricula.use-case.js';
import { UpdateCurriculaUseCase } from './use-cases/update-curriculum.use-case.js';

import { CreateCurriculumSubjectUseCase } from './use-cases/create-curriculum-subject.use-case.js';
import { BulkCreateCurriculumSubjectsUseCase } from './use-cases/bulk-create-curriculum-subjects.use-case.js';
import { DeleteCurriculumSubjectUseCase } from './use-cases/delete-curriculum-subject.use-case.js';
import { GetCurriculumSubjectByIdUseCase } from './use-cases/get-curriculum-subject-by-id.use-case.js';
import { GetCurriculumSubjectsUseCase } from './use-cases/get-curriculum-subjects.use-case.js';
import { UpdateCurriculumSubjectUseCase } from './use-cases/update-curriculum-subject.use-case.js';

import { ICurriculumRepository } from './domain/interfaces/curriculum-repository.interface.js';
import { ICurriculumSubjectRepository } from './domain/interfaces/curriculum-subject-repository.interface.js';

@Module({
  imports: [AcademicYearModule],
  controllers: [CurriculumController, CurriculumSubjectController],
  providers: [
    { provide: ICurriculumRepository, useClass: PrismaCurriculumRepository },
    {
      provide: ICurriculumSubjectRepository,
      useClass: PrismaCurriculumSubjectRepository,
    },
    GetCurriculaUseCase,
    GetCurriculaByIdUseCase,
    CreateCurriculaUseCase,
    UpdateCurriculaUseCase,
    DeleteCurriculaUseCase,
    GetCurriculumSubjectsUseCase,
    GetCurriculumSubjectByIdUseCase,
    CreateCurriculumSubjectUseCase,
    BulkCreateCurriculumSubjectsUseCase,
    UpdateCurriculumSubjectUseCase,
    DeleteCurriculumSubjectUseCase,
  ],
  exports: [ICurriculumRepository, ICurriculumSubjectRepository],
})
export class CurriculumModule {}
