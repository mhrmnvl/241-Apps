import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateNavItemInput,
  INavigationRepository,
} from '../domain/interfaces/navigation-repository.interface.js';
import {
  CreateNavItemDto,
  ReorderNavDto,
  UpdateNavItemDto,
} from '../dto/request/page.dto.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Exactly one destination per item.
 *
 * Checked here rather than in the DTO because the rule is about the
 * combination, and the message has to name what went wrong — "provide one of"
 * is actionable where a class-validator group error is not.
 */
function assertOneDestination(dto: {
  pageId?: string | null;
  routeKey?: string | null;
  externalUrl?: string | null;
}) {
  const set = [dto.pageId, dto.routeKey, dto.externalUrl].filter(
    (value) => value !== undefined && value !== null && value !== '',
  );

  if (set.length !== 1) {
    throw new BadRequestException(
      'Isi tepat satu tujuan: halaman portal, daftar bawaan, atau alamat luar.',
    );
  }
}

@Injectable()
export class GetNavigationUseCase {
  constructor(private readonly navigationRepository: INavigationRepository) {}

  async execute() {
    return this.navigationRepository.findAll();
  }
}

@Injectable()
export class GetPublicNavigationUseCase {
  constructor(private readonly navigationRepository: INavigationRepository) {}

  async execute() {
    return this.navigationRepository.findPublic();
  }
}

@Injectable()
export class CreateNavItemUseCase {
  private readonly logger = new Logger(CreateNavItemUseCase.name);

  constructor(
    private readonly navigationRepository: INavigationRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(dto: CreateNavItemDto) {
    assertOneDestination(dto);

    const item = await this.navigationRepository.create({
      label: dto.label,
      pageId: dto.pageId ?? null,
      routeKey: dto.routeKey ?? null,
      externalUrl: dto.externalUrl ?? null,
      displayOrder: dto.displayOrder,
      isActive: dto.isActive,
    });

    await this.cache.invalidate();

    this.logger.log(`Nav item created: "${item.label}"`);
    return item;
  }
}

@Injectable()
export class UpdateNavItemUseCase {
  private readonly logger = new Logger(UpdateNavItemUseCase.name);

  constructor(
    private readonly navigationRepository: INavigationRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: UpdateNavItemDto) {
    const existing = await this.navigationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }

    const data: CreateNavItemInput = {
      label: dto.label ?? existing.label,
      pageId: dto.pageId ?? existing.pageId,
      routeKey: dto.routeKey ?? existing.routeKey,
      externalUrl: dto.externalUrl ?? existing.externalUrl,
      displayOrder: dto.displayOrder ?? existing.displayOrder,
      isActive: dto.isActive ?? existing.isActive,
    };

    // Changing the destination means clearing the other two, or the merged
    // result carries the old one alongside the new and fails the check.
    if (
      dto.pageId !== undefined ||
      dto.routeKey !== undefined ||
      dto.externalUrl !== undefined
    ) {
      data.pageId = dto.pageId ?? null;
      data.routeKey = dto.routeKey ?? null;
      data.externalUrl = dto.externalUrl ?? null;
    }

    assertOneDestination(data);

    const updated = await this.navigationRepository.update(id, data);
    await this.cache.invalidate();

    this.logger.log(`Nav item updated: "${updated.label}"`);
    return updated;
  }
}

@Injectable()
export class ReorderNavigationUseCase {
  constructor(
    private readonly navigationRepository: INavigationRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(dto: ReorderNavDto): Promise<void> {
    const existing = await this.navigationRepository.findAll();
    const known = new Set(existing.map((item) => item.id));

    // An id the menu does not contain means the client is working from a stale
    // list — applying the rest would silently reorder around a phantom.
    const unknown = dto.itemIds.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw new BadRequestException(
        'Urutan memuat menu yang tidak ada. Muat ulang daftar menu.',
      );
    }

    await this.navigationRepository.reorder(dto.itemIds);
    await this.cache.invalidate();
  }
}

@Injectable()
export class DeleteNavItemUseCase {
  private readonly logger = new Logger(DeleteNavItemUseCase.name);

  constructor(
    private readonly navigationRepository: INavigationRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.navigationRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }

    // Hard delete: a menu entry holds no content of its own, and the page it
    // pointed at is untouched.
    await this.navigationRepository.delete(id);
    await this.cache.invalidate();

    this.logger.log(`Nav item deleted: "${existing.label}"`);
  }
}
