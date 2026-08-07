import { Module } from '@nestjs/common';
import { AuditLogModule } from '../../platform/audit-log/audit-log.module.js';
import { HtmlSanitizerService } from '../../shared/helpers/html-sanitizer.service.js';
import { MediaModule } from '../media/media.module.js';
import { TaxonomyModule } from '../taxonomy/taxonomy.module.js';
import { IPostRepository } from './domain/interfaces/post-repository.interface.js';
import { PostAuditService } from './services/post-audit.service.js';
import { PostStatusSyncService } from './services/post-status-sync.service.js';
import { ArchivePostUseCase } from './use-cases/archive-post.use-case.js';
import { DeletePostUseCase } from './use-cases/delete-post.use-case.js';
import { PinPostUseCase } from './use-cases/pin-post.use-case.js';
import { PreviewPostUseCase } from './use-cases/preview-post.use-case.js';
import { RestorePostUseCase } from './use-cases/restore-post.use-case.js';
import { UnpublishPostUseCase } from './use-cases/unpublish-post.use-case.js';
import { PrismaPostRepository } from './infrastructure/persistence/prisma-post.repository.js';
import { PostController } from './presentation/post.controller.js';
import { PostPublicController } from './presentation/post-public.controller.js';
import { CreatePostUseCase } from './use-cases/create-post.use-case.js';
import { GetPostByIdUseCase } from './use-cases/get-post-by-id.use-case.js';
import { GetPostsUseCase } from './use-cases/get-posts.use-case.js';
import { GetPublicPostBySlugUseCase } from './use-cases/get-public-post-by-slug.use-case.js';
import { GetPublicPostsUseCase } from './use-cases/get-public-posts.use-case.js';
import { GetRelatedPostsUseCase } from './use-cases/get-related-posts.use-case.js';
import { PublishPostUseCase } from './use-cases/publish-post.use-case.js';
import { UpdatePostUseCase } from './use-cases/update-post.use-case.js';

@Module({
  // The portal writes the first AuditLog rows in this codebase (FR-064), so it
  // consumes platform/audit-log as a supplier — the Module class is imported
  // directly, never through the feature barrel, which would close an ESM cycle.
  imports: [AuditLogModule, MediaModule, TaxonomyModule],
  controllers: [PostController, PostPublicController],
  providers: [
    { provide: IPostRepository, useClass: PrismaPostRepository },

    HtmlSanitizerService,
    PostAuditService,
    PostStatusSyncService,

    GetPostsUseCase,
    GetPostByIdUseCase,
    GetPublicPostsUseCase,
    GetPublicPostBySlugUseCase,
    GetRelatedPostsUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    PublishPostUseCase,
    UnpublishPostUseCase,
    ArchivePostUseCase,
    PinPostUseCase,
    PreviewPostUseCase,
    DeletePostUseCase,
    RestorePostUseCase,
  ],
  // Exported so the homepage aggregator can borrow content through the port
  // rather than querying portal_posts itself (Principle VI).
  // GetPublicPostBySlugUseCase goes out too: the metadata resolver needs the
  // same public-visibility answer the detail page gives, and reimplementing it
  // there is how the two would drift.
  exports: [IPostRepository, GetPublicPostBySlugUseCase],
})
export class PostModule {}
