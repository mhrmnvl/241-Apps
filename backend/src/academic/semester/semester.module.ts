import { Module } from '@nestjs/common';
import { AcademicYearModule } from '../academic-year/academic-year.module.js';
import { SemesterController } from './presentation/semester.controller.js';
import { SemesterRolloverController } from './presentation/semester-rollover.controller.js';
import { SemesterPromotionController } from './presentation/semester-promotion.controller.js';
import { PrismaSemesterRepository } from './infrastructure/persistence/prisma-semester.repository.js';
import { PrismaRolloverRepository } from './infrastructure/persistence/prisma-rollover.repository.js';
import { PrismaPromotionRepository } from './infrastructure/persistence/prisma-promotion.repository.js';
import { ActivateSemesterUseCase } from './use-cases/activate-semester.use-case.js';
import { CreateSemesterUseCase } from './use-cases/create-semester.use-case.js';
import { DeactivateSemesterUseCase } from './use-cases/deactivate-semester.use-case.js';
import { DeleteSemesterUseCase } from './use-cases/delete-semester.use-case.js';
import { GeneratePromotionRecommendationUseCase } from './use-cases/generate-promotion-recommendation.use-case.js';
import { GetSemesterByIdUseCase } from './use-cases/get-semester-by-id.use-case.js';
import { GetSemestersUseCase } from './use-cases/get-semesters.use-case.js';
import { PreviewPromotionUseCase } from './use-cases/preview-promotion.use-case.js';
import { PromoteStudentsUseCase } from './use-cases/promote-student.use-case.js';
import { PromotionSemesterResolver } from './services/promotion-semester-resolver.service.js';
import { RolloverSemesterUseCase } from './use-cases/rollover-semester.use-case.js';
import { UpdateSemesterUseCase } from './use-cases/update-semester.use-case.js';
import { ISemesterRepository } from './domain/interfaces/semester-repository.interface.js';
import { IRolloverRepository } from './domain/interfaces/rollover-repository.interface.js';
import { IPromotionRepository } from './domain/interfaces/promotion-repository.interface.js';

@Module({
  imports: [AcademicYearModule],
  controllers: [
    SemesterRolloverController,
    SemesterPromotionController,
    SemesterController,
  ],
  providers: [
    { provide: ISemesterRepository, useClass: PrismaSemesterRepository },
    { provide: IRolloverRepository, useClass: PrismaRolloverRepository },
    { provide: IPromotionRepository, useClass: PrismaPromotionRepository },
    GetSemestersUseCase,
    GetSemesterByIdUseCase,
    CreateSemesterUseCase,
    UpdateSemesterUseCase,
    DeleteSemesterUseCase,
    RolloverSemesterUseCase,
    PromotionSemesterResolver,
    PromoteStudentsUseCase,
    PreviewPromotionUseCase,
    GeneratePromotionRecommendationUseCase,
    ActivateSemesterUseCase,
    DeactivateSemesterUseCase,
  ],
  exports: [ISemesterRepository, IRolloverRepository],
})
export class SemesterModule {}
