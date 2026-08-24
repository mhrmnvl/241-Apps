import { Module } from '@nestjs/common';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { AssessmentModule } from '../assessment/assessment.module.js';
import { CurriculumModule } from '../curriculum/curriculum.module.js';
import { AttendanceModule } from '../attendance/attendance.module.js';
import { SchoolUnitModule } from '../../platform/school-unit/school-unit.module.js';
import { ReportCardController } from './presentation/report-card.controller.js';
import { PrismaReportCardRepository } from './infrastructure/persistence/prisma-report-card.repository.js';
import { BulkGenerateReportCardsUseCase } from './use-cases/bulk-generate-report-cards.use-case.js';
import { DeleteReportCardUseCase } from './use-cases/delete-report-card.use-case.js';
import { GenerateReportCardUseCase } from './use-cases/generate-report-card.use-case.js';
import { GetReportCardByIdUseCase } from './use-cases/get-report-card-by-id.use-case.js';
import { GetReportCardsUseCase } from './use-cases/get-report-cards.use-case.js';
import { GetMyReportCardsUseCase } from './use-cases/get-my-report-cards.use-case.js';
import { GetReportCardDetailUseCase } from './use-cases/get-report-card-detail.use-case.js';
import { GetMyReportCardDetailUseCase } from './use-cases/get-my-report-card-detail.use-case.js';
import { StudentModule } from '../student/student.module.js';
import { PublishReportCardUseCase } from './use-cases/publish-report-card.use-case.js';
import { UpdateReportCardUseCase } from './use-cases/update-report-card.use-case.js';
import { PdfService } from './services/pdf.service.js';
import { ExportReportCardPdfUseCase } from './use-cases/export-report-card-pdf.use-case.js';
import { IReportCardRepository } from './domain/interfaces/report-card-repository.interface.js';
import { AcademicSettingModule } from '../academic-setting/academic-setting.module.js';

@Module({
  imports: [
    AcademicSettingModule,
    AssessmentModule,
    CurriculumModule,
    EnrollmentModule,
    AttendanceModule,
    SchoolUnitModule,
    // For IStudentIdentityReadPort — resolving the caller to their own student
    // record, so `GET /rapors/me` answers about them and nobody else.
    StudentModule,
  ],
  controllers: [ReportCardController],
  providers: [
    {
      provide: IReportCardRepository,
      useClass: PrismaReportCardRepository,
    },
    GetReportCardsUseCase,
    GetMyReportCardsUseCase,
    GetReportCardByIdUseCase,
    GetReportCardDetailUseCase,
    GetMyReportCardDetailUseCase,
    GenerateReportCardUseCase,
    BulkGenerateReportCardsUseCase,
    UpdateReportCardUseCase,
    PublishReportCardUseCase,
    DeleteReportCardUseCase,
    PdfService,
    ExportReportCardPdfUseCase,
  ],
  exports: [IReportCardRepository],
})
export class ReportCardModule {}
