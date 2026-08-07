import { Module } from '@nestjs/common';
import { AgendaModule } from './agenda/agenda.module.js';
import { GalleryModule } from './gallery/gallery.module.js';
import { HomepageModule } from './homepage/homepage.module.js';
import { PortalHtmlModule } from './homepage/portal-html.module.js';
import { MediaModule } from './media/media.module.js';
import { PortalFileUsageModule } from './media/portal-file-usage.module.js';
import { PageModule } from './page/page.module.js';
import { PortalSharedModule } from './shared/portal-shared.module.js';
import { PostModule } from './post/post.module.js';
import { TaxonomyModule } from './taxonomy/taxonomy.module.js';

/**
 * Public school portal (portal-web). A domain holding sibling modules, not one
 * flat module — deliberately not the shape `admission/` grew into.
 *
 * Every module the spec calls for is present: post, homepage, taxonomy,
 * media, page, agenda, gallery.
 */
@Module({
  imports: [
    PostModule,
    HomepageModule,
    TaxonomyModule,
    MediaModule,
    PageModule,
    AgendaModule,
    GalleryModule,
    // Global by design — it registers the portal's implementation of
    // platform/file's usage-check port so file deletion can be vetoed without
    // platform learning anything about the portal. See the module's docblock.
    PortalFileUsageModule,
    // Also global: it carries the public response cache, which every public
    // controller and every publish-path use case reaches for.
    PortalSharedModule,
    // **Last, and it must stay last.** PortalHtmlModule's only controller
    // answers `GET *`, and Nest matches controllers in registration order — a
    // module listed after it would never receive a request.
    PortalHtmlModule,
  ],
  exports: [
    PostModule,
    HomepageModule,
    TaxonomyModule,
    MediaModule,
    PageModule,
    AgendaModule,
    GalleryModule,
  ],
})
export class PortalModule {}
