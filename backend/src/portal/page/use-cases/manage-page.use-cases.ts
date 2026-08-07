import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { toSlug, toUniqueSlug } from '../../../shared/helpers/slug.helper.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import {
  IPageRepository,
  UpdatePageInput,
} from '../domain/interfaces/page-repository.interface.js';
import {
  CreatePageDto,
  PageVersionDto,
  UpdatePageDto,
} from '../dto/request/page.dto.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const CONFLICT_MESSAGE =
  'Halaman ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.';

@Injectable()
export class GetPagesUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(includeDeleted = false) {
    return this.pageRepository.findAll(includeDeleted);
  }
}

@Injectable()
export class GetPageByIdUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(id: string) {
    const page = await this.pageRepository.findById(id);
    if (!page || page.deletedAt) {
      throw new NotFoundException(`Halaman dengan ID ${id} tidak ditemukan`);
    }
    return page;
  }
}

@Injectable()
export class CreatePageUseCase {
  private readonly logger = new Logger(CreatePageUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
  ) {}

  async execute(dto: CreatePageDto, authorId: string) {
    const base = toSlug(dto.slug ?? dto.title);
    if (base.length === 0) {
      throw new BadRequestException(
        'Judul tidak menghasilkan alamat yang valid. Gunakan minimal satu huruf atau angka.',
      );
    }
    const taken = await this.pageRepository.findTakenSlugs(base);

    const page = await this.pageRepository.create({
      title: dto.title,
      slug: toUniqueSlug(dto.slug ?? dto.title, taken),
      // Sanitize on write: the API is the trust boundary, not the editor.
      body: this.sanitizer.sanitize(dto.body),
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      authorId,
    });

    await this.syncMediaUsage.execute({
      column: 'pageId',
      ownerId: page.id,
      body: page.body,
    });

    this.logger.log(`Portal page created as draft: "${page.title}"`);
    return page;
  }
}

@Injectable()
export class UpdatePageUseCase {
  private readonly logger = new Logger(UpdatePageUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: UpdatePageDto) {
    const existing = await this.pageRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Halaman dengan ID ${id} tidak ditemukan`);
    }

    const data: UpdatePageInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.body !== undefined) data.body = this.sanitizer.sanitize(dto.body);
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle || null;
    if (dto.metaDescription !== undefined) {
      data.metaDescription = dto.metaDescription || null;
    }

    // Retitling never moves the address on its own — "Profil" is linked from
    // the school's printed material as much as from the menu (FR-054).
    const slugChanged = dto.slug !== undefined && dto.slug !== existing.slug;
    if (slugChanged) data.slug = toSlug(dto.slug!);

    const updated = await this.pageRepository.update(id, dto.version, data);
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    if (slugChanged && existing.publishedAt !== null) {
      await this.pageRepository.recordSlugHistory(updated.id, existing.slug);
    }

    await this.syncMediaUsage.execute({
      column: 'pageId',
      ownerId: updated.id,
      body: updated.body,
    });

    // Only a published page can have a cached public copy to stale.
    if (updated.publishedAt !== null) await this.cache.invalidate();

    this.logger.log(`Portal page updated: "${updated.title}"`);
    return updated;
  }
}

@Injectable()
export class PublishPageUseCase {
  private readonly logger = new Logger(PublishPageUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PageVersionDto) {
    const existing = await this.pageRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Halaman dengan ID ${id} tidak ditemukan`);
    }

    // A page needs a title and a body and nothing else — it has no category,
    // no cover, and no feed placement to be missing (FR-052).
    if (!existing.title.trim() || !existing.body.trim()) {
      throw new BadRequestException(
        'Halaman memerlukan judul dan isi sebelum dapat diterbitkan.',
      );
    }

    // publishedAt is preserved across re-publishes of an already-published page
    // only in the sense that unpublish clears it — a fresh publish is a fresh
    // date, matching how posts behave.
    const published = await this.pageRepository.publish(
      id,
      dto.version,
      existing.publishedAt ?? new Date(),
    );
    if (!published) throw new ConflictException(CONFLICT_MESSAGE);

    await this.cache.invalidate();

    this.logger.log(`Portal page published: "${published.title}"`);
    return published;
  }
}

@Injectable()
export class UnpublishPageUseCase {
  private readonly logger = new Logger(UnpublishPageUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PageVersionDto) {
    const existing = await this.pageRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Halaman dengan ID ${id} tidak ditemukan`);
    }

    const updated = await this.pageRepository.unpublish(id, dto.version);
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    // The cached navigation has to go with it, or the menu keeps linking here
    // until the TTL expires.
    await this.cache.invalidate();

    // Any navigation item pointing here drops out of the public menu on the
    // next request — the public query filters on page visibility rather than
    // on a flag someone has to remember to clear (FR-053).
    this.logger.log(`Portal page unpublished: "${updated.title}"`);
    return updated;
  }
}

@Injectable()
export class DeletePageUseCase {
  private readonly logger = new Logger(DeletePageUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.pageRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Halaman dengan ID ${id} tidak ditemukan`);
    }

    await this.pageRepository.softDelete(id);
    await this.cache.invalidate();
    this.logger.log(`Portal page soft-deleted: "${existing.title}"`);
  }
}
