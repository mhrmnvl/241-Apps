import { Module } from '@nestjs/common';
import { HtmlSanitizerService } from '../../shared/helpers/html-sanitizer.service.js';
import { MediaModule } from '../media/media.module.js';
import { IAgendaRepository } from './domain/interfaces/agenda-repository.interface.js';
import { PrismaAgendaRepository } from './infrastructure/persistence/prisma-agenda.repository.js';
import { AgendaController } from './presentation/agenda.controller.js';
import { AgendaPublicController } from './presentation/agenda-public.controller.js';
import {
  GetPublicAgendaBySlugUseCase,
  GetPublicAgendaUseCase,
} from './use-cases/get-public-agenda.use-case.js';
import {
  ArchiveAgendaUseCase,
  CreateAgendaUseCase,
  DeleteAgendaUseCase,
  GetAgendaByIdUseCase,
  GetAgendaEntriesUseCase,
  PublishAgendaUseCase,
  RestoreAgendaUseCase,
  UnpublishAgendaUseCase,
  UpdateAgendaUseCase,
} from './use-cases/manage-agenda.use-cases.js';

@Module({
  imports: [MediaModule],
  controllers: [AgendaController, AgendaPublicController],
  providers: [
    { provide: IAgendaRepository, useClass: PrismaAgendaRepository },

    HtmlSanitizerService,

    GetAgendaEntriesUseCase,
    GetAgendaByIdUseCase,
    CreateAgendaUseCase,
    UpdateAgendaUseCase,
    PublishAgendaUseCase,
    UnpublishAgendaUseCase,
    ArchiveAgendaUseCase,
    DeleteAgendaUseCase,
    RestoreAgendaUseCase,
    GetPublicAgendaUseCase,
    GetPublicAgendaBySlugUseCase,
  ],
  // Exported so the homepage aggregator can borrow upcoming entries through
  // the port rather than querying portal_agenda_entries itself (Principle VI).
  exports: [IAgendaRepository],
})
export class AgendaModule {}
