import { Module } from '@nestjs/common';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module.js';
import { SemesterModule } from '../semester/semester.module.js';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { AssessmentItemController } from './presentation/assessment-item.controller.js';
import { AssessmentWeightController } from './presentation/assessment-weight.controller.js';
import { StudentScoreController } from './presentation/student-score.controller.js';
import { PrismaAssessmentItemRepository } from './infrastructure/persistence/prisma-assessment-item.repository.js';
import { PrismaAssessmentWeightRepository } from './infrastructure/persistence/prisma-assessment-weight.repository.js';
import { PrismaStudentScoreRepository } from './infrastructure/persistence/prisma-student-score.repository.js';
import { IAssessmentItemRepository } from './domain/interfaces/assessment-item-repository.interface.js';
import { IAssessmentWeightRepository } from './domain/interfaces/assessment-weight-repository.interface.js';
import { IStudentScoreRepository } from './domain/interfaces/student-score-repository.interface.js';

import { GetAssessmentItemsUseCase } from './use-cases/get-assessment-items.use-case.js';
import { GetAssessmentItemByIdUseCase } from './use-cases/get-assessment-item-by-id.use-case.js';
import { CreateAssessmentItemUseCase } from './use-cases/create-assessment-item.use-case.js';
import { UpdateAssessmentItemUseCase } from './use-cases/update-assessment-item.use-case.js';
import { DeleteAssessmentItemUseCase } from './use-cases/delete-assessment-item.use-case.js';
import { GetAssessmentWeightsUseCase } from './use-cases/get-assessment-weights.use-case.js';
import { ReplaceAssessmentWeightsUseCase } from './use-cases/replace-assessment-weights.use-case.js';

import { GetStudentScoresUseCase } from './use-cases/get-student-scores.use-case.js';
import { GetStudentScoreByIdUseCase } from './use-cases/get-student-score-by-id.use-case.js';
import { CreateStudentScoreUseCase } from './use-cases/create-student-score.use-case.js';
import { UpdateStudentScoreUseCase } from './use-cases/update-student-score.use-case.js';
import { DeleteStudentScoreUseCase } from './use-cases/delete-student-score.use-case.js';
import { GetStudentScoreRosterUseCase } from './use-cases/get-student-score-roster.use-case.js';
import { BulkUpsertStudentScoresUseCase } from './use-cases/bulk-upsert-student-scores.use-case.js';

@Module({
  imports: [TeachingAssignmentModule, SemesterModule, EnrollmentModule],
  controllers: [
    AssessmentItemController,
    AssessmentWeightController,
    StudentScoreController,
  ],
  providers: [
    {
      provide: IAssessmentItemRepository,
      useClass: PrismaAssessmentItemRepository,
    },
    {
      provide: IAssessmentWeightRepository,
      useClass: PrismaAssessmentWeightRepository,
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

    GetAssessmentWeightsUseCase,
    ReplaceAssessmentWeightsUseCase,

    GetStudentScoresUseCase,
    GetStudentScoreByIdUseCase,
    CreateStudentScoreUseCase,
    UpdateStudentScoreUseCase,
    DeleteStudentScoreUseCase,
    GetStudentScoreRosterUseCase,
    BulkUpsertStudentScoresUseCase,
  ],
  exports: [
    IAssessmentItemRepository,
    IAssessmentWeightRepository,
    IStudentScoreRepository,
  ],
})
export class AssessmentModule {}
