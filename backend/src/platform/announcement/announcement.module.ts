import { Module } from '@nestjs/common';
import { ClassroomModule } from '../../academic/classroom/classroom.module.js';
import { AnnouncementController } from './presentation/announcement.controller.js';
import { IAnnouncementRepository } from './domain/interfaces/announcement-repository.interface.js';
import { PrismaAnnouncementRepository } from './infrastructure/persistence/prisma-announcement.repository.js';
import { CreateAnnouncementUseCase } from './use-cases/create-announcement.use-case.js';
import { DeleteAnnouncementUseCase } from './use-cases/delete-announcement.use-case.js';
import { GetAnnouncementByIdUseCase } from './use-cases/get-announcement-by-id.use-case.js';
import { GetAnnouncementsUseCase } from './use-cases/get-announcements.use-case.js';
import { UpdateAnnouncementUseCase } from './use-cases/update-announcement.use-case.js';

@Module({
  imports: [ClassroomModule],
  controllers: [AnnouncementController],
  providers: [
    {
      provide: IAnnouncementRepository,
      useClass: PrismaAnnouncementRepository,
    },

    GetAnnouncementsUseCase,
    GetAnnouncementByIdUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
  ],
  exports: [IAnnouncementRepository],
})
export class AnnouncementModule {}
