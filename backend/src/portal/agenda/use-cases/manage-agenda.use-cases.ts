import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { toSlug, toUniqueSlug } from '../../../shared/helpers/slug.helper.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import {
  IAgendaRepository,
  UpdateAgendaInput,
} from '../domain/interfaces/agenda-repository.interface.js';
import {
  AgendaQueryDto,
  AgendaVersionDto,
  CreateAgendaDto,
  PublishAgendaDto,
  UpdateAgendaDto,
} from '../dto/request/agenda.dto.js';
import { toAdminAgenda } from '../infrastructure/mappers/agenda.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const CONFLICT_MESSAGE =
  'This agenda entry was changed by someone else. Reload before saving.';

/**
 * FR-042. Checked as a pair rather than field by field, because neither time is
 * wrong on its own — an entry that ends before it starts is what the school
 * notices when the listing orders it somewhere nonsensical.
 */
function assertValidRange(startTime: Date, endTime: Date) {
  if (endTime.getTime() <= startTime.getTime()) {
    throw new BadRequestException('End time must be after the start time');
  }
}

@Injectable()
export class GetAgendaEntriesUseCase {
  constructor(private readonly agendaRepository: IAgendaRepository) {}

  async execute(query: AgendaQueryDto): Promise<PaginatedResponse<unknown>> {
    const { data, total, page, limit } = await this.agendaRepository.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: data.map(toAdminAgenda),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class GetAgendaByIdUseCase {
  constructor(private readonly agendaRepository: IAgendaRepository) {}

  async execute(id: string) {
    const entry = await this.agendaRepository.findById(id);
    if (!entry || entry.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }
    return toAdminAgenda(entry);
  }
}

@Injectable()
export class CreateAgendaUseCase {
  private readonly logger = new Logger(CreateAgendaUseCase.name);

  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
  ) {}

  async execute(dto: CreateAgendaDto, authorId: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    assertValidRange(startTime, endTime);

    const base = toSlug(dto.slug ?? dto.title);
    if (base.length === 0) {
      throw new BadRequestException('The title does not produce a valid slug');
    }
    const taken = await this.agendaRepository.findTakenSlugs(base);

    const entry = await this.agendaRepository.create({
      title: dto.title,
      slug: toUniqueSlug(dto.slug ?? dto.title, taken),
      description: this.sanitizer.sanitize(dto.description),
      startTime,
      endTime,
      location: dto.location,
      coverFileId: dto.coverFileId ?? null,
      authorId,
    });

    await this.syncMediaUsage.execute({
      column: 'agendaId',
      ownerId: entry.id,
      body: entry.description,
      coverFileId: entry.coverFileId,
    });

    this.logger.log(`Agenda created as draft: "${entry.title}"`);
    return toAdminAgenda(entry);
  }
}

@Injectable()
export class UpdateAgendaUseCase {
  private readonly logger = new Logger(UpdateAgendaUseCase.name);

  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: UpdateAgendaDto) {
    const existing = await this.agendaRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }

    const data: UpdateAgendaInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) {
      data.description = this.sanitizer.sanitize(dto.description);
    }
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.coverFileId !== undefined) data.coverFileId = dto.coverFileId;
    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      data.slug = toSlug(dto.slug);
    }

    // Validated against the merged result, not the payload: moving only the end
    // time can still produce an invalid range against the stored start.
    const startTime =
      dto.startTime !== undefined
        ? new Date(dto.startTime)
        : existing.startTime;
    const endTime =
      dto.endTime !== undefined ? new Date(dto.endTime) : existing.endTime;
    if (dto.startTime !== undefined || dto.endTime !== undefined) {
      assertValidRange(startTime, endTime);
      data.startTime = startTime;
      data.endTime = endTime;
    }

    const updated = await this.agendaRepository.update(id, dto.version, data);
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    await this.syncMediaUsage.execute({
      column: 'agendaId',
      ownerId: updated.id,
      body: updated.description,
      coverFileId: updated.coverFileId,
    });

    // Only a published entry can have a cached public copy to stale.
    if (updated.publishedAt !== null) await this.cache.invalidate();

    this.logger.log(`Agenda updated: "${updated.title}"`);
    return toAdminAgenda(updated);
  }
}

@Injectable()
export class PublishAgendaUseCase {
  private readonly logger = new Logger(PublishAgendaUseCase.name);

  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PublishAgendaDto) {
    const existing = await this.agendaRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }

    const now = new Date();
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (scheduledAt && scheduledAt.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'The scheduled publish time must be in the future. Leave it empty to publish now.',
      );
    }

    const published = await this.agendaRepository.publish(
      id,
      dto.version,
      scheduledAt ? ContentStatus.SCHEDULED : ContentStatus.PUBLISHED,
      scheduledAt ?? now,
      scheduledAt,
    );
    if (!published) throw new ConflictException(CONFLICT_MESSAGE);

    await this.cache.invalidate();

    this.logger.log(`Agenda published: "${published.title}"`);
    return toAdminAgenda(published);
  }
}

@Injectable()
export class UnpublishAgendaUseCase {
  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: AgendaVersionDto) {
    const existing = await this.agendaRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }

    const updated = await this.agendaRepository.unpublish(id, dto.version);
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    await this.cache.invalidate();
    return toAdminAgenda(updated);
  }
}

@Injectable()
export class ArchiveAgendaUseCase {
  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: AgendaVersionDto) {
    const existing = await this.agendaRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }

    const updated = await this.agendaRepository.archive(id, dto.version);
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    await this.cache.invalidate();
    return toAdminAgenda(updated);
  }
}

@Injectable()
export class DeleteAgendaUseCase {
  constructor(
    private readonly agendaRepository: IAgendaRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.agendaRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }
    await this.agendaRepository.softDelete(id);
    await this.cache.invalidate();
  }
}

@Injectable()
export class RestoreAgendaUseCase {
  constructor(private readonly agendaRepository: IAgendaRepository) {}

  async execute(id: string) {
    const existing = await this.agendaRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Agenda entry ${id} not found`);
    }
    if (!existing.deletedAt) {
      throw new BadRequestException('This agenda entry is not in the trash');
    }

    return toAdminAgenda(await this.agendaRepository.restore(id));
  }
}
