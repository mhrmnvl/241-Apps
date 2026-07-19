import { Module } from '@nestjs/common';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { AssessmentModule } from '../assessment/assessment.module.js';
import { SchoolUnitModule } from '../../platform/school-unit/school-unit.module.js';
import { ReportCardController } from './presentation/report-card.controller.js';
import { PrismaReportCardRepository } from './infrastructure/persistence/prisma-report-card.repository.js';
import { DeleteReportCardUseCase } from './use-cases/delete-report-card.use-case.js';
import { GenerateReportCardUseCase } from './use-cases/generate-report-card.use-case.js';
import { GetReportCardByIdUseCase } from './use-cases/get-report-card-by-id.use-case.js';
import { GetReportCardsUseCase } from './use-cases/get-report-cards.use-case.js';
import { PublishReportCardUseCase } from './use-cases/publish-report-card.use-case.js';
import { UpdateReportCardUseCase } from './use-cases/update-report-card.use-case.js';
import { PdfService } from './services/pdf.service.js';
import { ExportReportCardPdfUseCase } from './use-cases/export-report-card-pdf.use-case.js';
import { IReportCardRepository } from './domain/interfaces/report-card-repository.interface.js';

@Module({
  imports: [AssessmentModule, EnrollmentModule, SchoolUnitModule],
  controllers: [ReportCardController],
  providers: [
    {
      provide: IReportCardRepository,
      useClass: PrismaReportCardRepository,
    },
    GetReportCardsUseCase,
    GetReportCardByIdUseCase,
    GenerateReportCardUseCase,
    UpdateReportCardUseCase,
    PublishReportCardUseCase,
    DeleteReportCardUseCase,
    PdfService,
    ExportReportCardPdfUseCase,
  ],
  exports: [IReportCardRepository],
})
export class ReportCardModule {}
