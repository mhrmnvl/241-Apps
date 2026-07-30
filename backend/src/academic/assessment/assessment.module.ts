import { Module } from '@nestjs/common';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module.js';
import { SemesterModule } from '../semester/semester.module.js';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { AssessmentItemsController } from './presentation/assessment-items.controller.js';
import { StudentScoresController } from './presentation/student-scores.controller.js';
import { PrismaAssessmentItemRepository } from './infrastructure/persistence/prisma-assessment-items.repository.js';
import { PrismaStudentScoreRepository } from './infrastructure/persistence/prisma-student-scores.repository.js';
import { IAssessmentItemRepository } from './domain/interfaces/assessment-items-repository.interface.js';
import { IStudentScoreRepository } from './domain/interfaces/student-scores-repository.interface.js';

import { GetAssessmentItemsUseCase } from './use-cases/get-assessment-items.use-case.js';
import { GetAssessmentItemByIdUseCase } from './use-cases/get-assessment-item-by-id.use-case.js';
import { CreateAssessmentItemUseCase } from './use-cases/create-assessment-item.use-case.js';
import { UpdateAssessmentItemUseCase } from './use-cases/update-assessment-item.use-case.js';
import { DeleteAssessmentItemUseCase } from './use-cases/delete-assessment-item.use-case.js';

import { GetStudentScoresUseCase } from './use-cases/get-student-scores.use-case.js';
import { GetStudentScoreByIdUseCase } from './use-cases/get-student-score-by-id.use-case.js';
import { CreateStudentScoreUseCase } from './use-cases/create-student-score.use-case.js';
import { UpdateStudentScoreUseCase } from './use-cases/update-student-score.use-case.js';
import { DeleteStudentScoreUseCase } from './use-cases/delete-student-score.use-case.js';
import { GetStudentScoreRosterUseCase } from './use-cases/get-student-score-roster.use-case.js';
import { BulkUpsertStudentScoresUseCase } from './use-cases/bulk-upsert-student-scores.use-case.js';

@Module({
  imports: [TeachingAssignmentModule, SemesterModule, EnrollmentModule],
  controllers: [AssessmentItemsController, StudentScoresController],
  providers: [
    {
      provide: IAssessmentItemRepository,
      useClass: PrismaAssessmentItemRepository,
    },
    {
      provide: IStudentScoreRepository,
      useClass: PrismaStudentScoreRepository,
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
  exports: [IAssessmentItemRepository, IStudentScoreRepository],
})
export class AssessmentModule {}
