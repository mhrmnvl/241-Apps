import { Module } from '@nestjs/common';
import { AuthModule } from '../platform/auth/auth.module.js';
import { UserModule } from '../platform/user/user.module.js';
import { IAdmissionAnnouncementRepository } from './domain/interfaces/admission-announcement-repository.interface.js';
import { IAdmissionApplicantRepository } from './domain/interfaces/admission-applicant-repository.interface.js';
import { IAdmissionApplicationRepository } from './domain/interfaces/admission-application-repository.interface.js';
import { IAdmissionWaveRepository } from './domain/interfaces/admission-wave-repository.interface.js';
import { PrismaAdmissionAnnouncementRepository } from './infrastructure/persistence/prisma-admission-announcement.repository.js';
import { PrismaAdmissionApplicantRepository } from './infrastructure/persistence/prisma-admission-applicant.repository.js';
import { PrismaAdmissionApplicationRepository } from './infrastructure/persistence/prisma-admission-application.repository.js';
import { PrismaAdmissionWaveRepository } from './infrastructure/persistence/prisma-admission-wave.repository.js';
import { AdmissionAdminController } from './presentation/admission-admin.controller.js';
import { AdmissionAnnouncementController } from './presentation/admission-announcement.controller.js';
import { AdmissionApplicantController } from './presentation/admission-applicant.controller.js';
import { AdmissionPublicController } from './presentation/admission-public.controller.js';
import { AdmissionWaveController } from './presentation/admission-wave.controller.js';
import { AdmissionNotificationService } from './services/admission-notification.service.js';
import { AcceptApplicationUseCase } from './use-cases/accept-application.use-case.js';
import {
  CreateAdmissionAnnouncementUseCase,
  DeleteAdmissionAnnouncementUseCase,
  GetAdmissionAnnouncementsUseCase,
  PublishAdmissionAnnouncementUseCase,
  UpdateAdmissionAnnouncementUseCase,
} from './use-cases/admission-announcement.use-cases.js';
import {
  CreateAdmissionWaveUseCase,
  DeleteAdmissionWaveUseCase,
  GetAdmissionWaveByIdUseCase,
  GetAdmissionWavesUseCase,
  UpdateAdmissionWaveUseCase,
} from './use-cases/admission-wave.use-cases.js';
import { EnrollApplicantUseCase } from './use-cases/enroll-applicant.use-case.js';
import { GetActiveWavesUseCase } from './use-cases/get-active-waves.use-case.js';
import { GetAdmissionStatsUseCase } from './use-cases/get-admission-stats.use-case.js';
import { GetApplicationByIdUseCase } from './use-cases/get-application-by-id.use-case.js';
import { GetApplicationsUseCase } from './use-cases/get-applications.use-case.js';
import { GetMyApplicationUseCase } from './use-cases/get-my-application.use-case.js';
import { GetMyNotificationsUseCase } from './use-cases/get-my-notifications.use-case.js';
import { GetPublishedAnnouncementsUseCase } from './use-cases/get-published-announcements.use-case.js';
import { MarkNotificationReadUseCase } from './use-cases/mark-notification-read.use-case.js';
import { RegisterApplicantUseCase } from './use-cases/register-applicant.use-case.js';
import { RejectApplicationUseCase } from './use-cases/reject-application.use-case.js';
import { RequestRevisionUseCase } from './use-cases/request-revision.use-case.js';
import { SubmitApplicationUseCase } from './use-cases/submit-application.use-case.js';
import { UpdateMyApplicationUseCase } from './use-cases/update-my-application.use-case.js';
import { UploadAdmissionDocumentUseCase } from './use-cases/upload-admission-document.use-case.js';
import { UploadPaymentProofUseCase } from './use-cases/upload-payment-proof.use-case.js';
import { VerifyApplicationUseCase } from './use-cases/verify-application.use-case.js';
import { VerifyDocumentUseCase } from './use-cases/verify-document.use-case.js';
import { VerifyPaymentUseCase } from './use-cases/verify-payment.use-case.js';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [
    // Registration order matters: 'waves/active' must match before 'waves/:id'.
    AdmissionPublicController,
    AdmissionApplicantController,
    AdmissionAdminController,
    AdmissionWaveController,
    AdmissionAnnouncementController,
  ],
  providers: [
    {
      provide: IAdmissionWaveRepository,
      useClass: PrismaAdmissionWaveRepository,
    },
    {
      provide: IAdmissionAnnouncementRepository,
      useClass: PrismaAdmissionAnnouncementRepository,
    },
    {
      provide: IAdmissionApplicationRepository,
      useClass: PrismaAdmissionApplicationRepository,
    },
    {
      provide: IAdmissionApplicantRepository,
      useClass: PrismaAdmissionApplicantRepository,
    },
    AdmissionNotificationService,
    GetActiveWavesUseCase,
    RegisterApplicantUseCase,
    GetMyApplicationUseCase,
    UpdateMyApplicationUseCase,
    SubmitApplicationUseCase,
    UploadAdmissionDocumentUseCase,
    UploadPaymentProofUseCase,
    GetMyNotificationsUseCase,
    MarkNotificationReadUseCase,
    GetPublishedAnnouncementsUseCase,
    GetApplicationsUseCase,
    GetApplicationByIdUseCase,
    VerifyDocumentUseCase,
    VerifyPaymentUseCase,
    RequestRevisionUseCase,
    VerifyApplicationUseCase,
    AcceptApplicationUseCase,
    RejectApplicationUseCase,
    EnrollApplicantUseCase,
    GetAdmissionStatsUseCase,
    GetAdmissionWavesUseCase,
    GetAdmissionWaveByIdUseCase,
    CreateAdmissionWaveUseCase,
    UpdateAdmissionWaveUseCase,
    DeleteAdmissionWaveUseCase,
    GetAdmissionAnnouncementsUseCase,
    CreateAdmissionAnnouncementUseCase,
    UpdateAdmissionAnnouncementUseCase,
    PublishAdmissionAnnouncementUseCase,
    DeleteAdmissionAnnouncementUseCase,
  ],
})
export class AdmissionModule {}
