import { Module } from '@nestjs/common';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module.js';
import { SemesterModule } from '../semester/semester.module.js';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { AssessmentItemsController } from './presentation/assessment-items.controller.js';
import { StudentScoresController } from './presentation/student-scores.controller.js';
import { PrismaAssessmentItemsRepository } from './infrastructure/persistence/prisma-assessment-items.repository.js';
import { PrismaStudentScoresRepository } from './infrastructure/persistence/prisma-student-scores.repository.js';
import { IAssessmentItemsRepository } from './domain/interfaces/assessment-items-repository.interface.js';
import { IStudentScoresRepository } from './domain/interfaces/student-scores-repository.interface.js';

import {
  CreateAssessmentItemUseCase,
  DeleteAssessmentItemUseCase,
  GetAssessmentItemByIdUseCase,
  GetAssessmentItemsUseCase,
  UpdateAssessmentItemUseCase,
} from './use-cases/assessment-item.use-case.js';

import {
  CreateStudentScoreUseCase,
  DeleteStudentScoreUseCase,
  GetStudentScoreByIdUseCase,
  GetStudentScoresUseCase,
  UpdateStudentScoreUseCase,
  GetStudentScoreRosterUseCase,
  BulkUpsertStudentScoresUseCase,
} from './use-cases/student-score.use-case.js';

@Module({
  imports: [TeachingAssignmentModule, SemesterModule, EnrollmentModule],
  controllers: [AssessmentItemsController, StudentScoresController],
  providers: [
    {
      provide: IAssessmentItemsRepository,
      useClass: PrismaAssessmentItemsRepository,
    },
    {
      provide: IStudentScoresRepository,
      useClass: PrismaStudentScoresRepository,
    },

    GetAssessmentItemsUseCase,
    GetAssessmentItemByIdUseCase,
    CreateAssessmentItemUseCase,
    UpdateAssessmentItemUseCase,
    DeleteAssessmentItemUseCase,

    GetStudentScoresUseCase,
    GetStudentScoreByIdUseCase,
    CreateStudentScoreUseCase,
    UpdateStudentScoreUseCase,
    DeleteStudentScoreUseCase,
    GetStudentScoreRosterUseCase,
    BulkUpsertStudentScoresUseCase,
  ],
  exports: [IAssessmentItemsRepository, IStudentScoresRepository],
})
export class AssessmentModule {}
