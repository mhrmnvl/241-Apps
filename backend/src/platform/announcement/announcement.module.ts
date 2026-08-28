import { Module } from '@nestjs/common';
import { ClassroomModule } from '../../academic/classroom/classroom.module.js';
import { EnrollmentModule } from '../../academic/enrollment/enrollment.module.js';
import { StudentModule } from '../../academic/student/student.module.js';
import { AnnouncementController } from './presentation/announcement.controller.js';
import { IAnnouncementRepository } from './domain/interfaces/announcement-repository.interface.js';
import { PrismaAnnouncementRepository } from './infrastructure/persistence/prisma-announcement.repository.js';
import { CreateAnnouncementUseCase } from './use-cases/create-announcement.use-case.js';
import { DeleteAnnouncementUseCase } from './use-cases/delete-announcement.use-case.js';
import { GetAnnouncementByIdUseCase } from './use-cases/get-announcement-by-id.use-case.js';
import { GetAnnouncementsUseCase } from './use-cases/get-announcements.use-case.js';
import { GetMyAnnouncementsUseCase } from './use-cases/get-my-announcements.use-case.js';
import { UpdateAnnouncementUseCase } from './use-cases/update-announcement.use-case.js';

@Module({
  // `StudentModule` and `EnrollmentModule` for the self-service read: whose
  // noticeboard this is comes from the caller's enrolment, never their role.
  imports: [ClassroomModule, StudentModule, EnrollmentModule],
  controllers: [AnnouncementController],
  providers: [
    {
      provide: IAnnouncementRepository,
      useClass: PrismaAnnouncementRepository,
    },

    GetAnnouncementsUseCase,
    GetMyAnnouncementsUseCase,
    GetAnnouncementByIdUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
  ],
  exports: [IAnnouncementRepository],
})
export class AnnouncementModule {}
