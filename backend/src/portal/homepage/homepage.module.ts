import { Module } from '@nestjs/common';
import { AgendaModule } from '../agenda/agenda.module.js';
import { GalleryModule } from '../gallery/gallery.module.js';
import { PageModule } from '../page/page.module.js';
import { PostModule } from '../post/post.module.js';
import { IHomepageSectionRepository } from './domain/interfaces/homepage-section-repository.interface.js';
import { PrismaHomepageSectionRepository } from './infrastructure/persistence/prisma-homepage-section.repository.js';
import { HomepageController } from './presentation/homepage.controller.js';
import {
  HomepagePublicController,
  PortalDiscoveryController,
} from './presentation/homepage-public.controller.js';
import { GetHomepageUseCase } from './use-cases/get-homepage.use-case.js';
import { GetPageMetaUseCase } from './use-cases/get-page-meta.use-case.js';
import { GetSitemapUseCase } from './use-cases/get-sitemap.use-case.js';
import { UpdateHomepageSectionUseCase } from './use-cases/update-homepage-section.use-case.js';

// Imported for the exported repository ports and the public by-slug use case —
// the aggregator borrows content through ports instead of querying another
// module's tables.
@Module({
  imports: [PostModule, AgendaModule, GalleryModule, PageModule],
  controllers: [
    HomepageController,
    HomepagePublicController,
    PortalDiscoveryController,
  ],
  providers: [
    {
      provide: IHomepageSectionRepository,
      useClass: PrismaHomepageSectionRepository,
    },
    GetHomepageUseCase,
    UpdateHomepageSectionUseCase,
    GetPageMetaUseCase,
    GetSitemapUseCase,
  ],
  // Both go out to PortalHtmlModule: it serves the SPA shell with injected
  // metadata, and the XML sitemap a crawler actually reads.
  exports: [IHomepageSectionRepository, GetPageMetaUseCase, GetSitemapUseCase],
})
export class HomepageModule {}
