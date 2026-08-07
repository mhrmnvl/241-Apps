import { Module } from '@nestjs/common';
import { HtmlSanitizerService } from '../../shared/helpers/html-sanitizer.service.js';
import { MediaModule } from '../media/media.module.js';
import { INavigationRepository } from './domain/interfaces/navigation-repository.interface.js';
import { IPageRepository } from './domain/interfaces/page-repository.interface.js';
import { PrismaNavigationRepository } from './infrastructure/persistence/prisma-navigation.repository.js';
import { PrismaPageRepository } from './infrastructure/persistence/prisma-page.repository.js';
import { NavigationController } from './presentation/navigation.controller.js';
import { PageController } from './presentation/page.controller.js';
import { PagePublicController } from './presentation/page-public.controller.js';
import { GetPublicPageUseCase } from './use-cases/get-public-page.use-case.js';
import {
  CreateNavItemUseCase,
  DeleteNavItemUseCase,
  GetNavigationUseCase,
  GetPublicNavigationUseCase,
  ReorderNavigationUseCase,
  UpdateNavItemUseCase,
} from './use-cases/manage-navigation.use-cases.js';
import {
  CreatePageUseCase,
  DeletePageUseCase,
  GetPageByIdUseCase,
  GetPagesUseCase,
  PublishPageUseCase,
  UnpublishPageUseCase,
  UpdatePageUseCase,
} from './use-cases/manage-page.use-cases.js';

@Module({
  imports: [MediaModule],
  controllers: [PageController, NavigationController, PagePublicController],
  providers: [
    { provide: IPageRepository, useClass: PrismaPageRepository },
    { provide: INavigationRepository, useClass: PrismaNavigationRepository },

    HtmlSanitizerService,

    GetPagesUseCase,
    GetPageByIdUseCase,
    CreatePageUseCase,
    UpdatePageUseCase,
    PublishPageUseCase,
    UnpublishPageUseCase,
    DeletePageUseCase,
    GetPublicPageUseCase,

    GetNavigationUseCase,
    GetPublicNavigationUseCase,
    CreateNavItemUseCase,
    UpdateNavItemUseCase,
    ReorderNavigationUseCase,
    DeleteNavItemUseCase,
  ],
  exports: [IPageRepository, GetPublicPageUseCase],
})
export class PageModule {}
