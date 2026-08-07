import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RESTORE_WINDOW_DAYS } from '../constants/post.constants.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Brings a soft-deleted item back, within 30 days (FR-019).
 *
 * It returns to the state it was deleted in, not to a draft: soft delete never
 * touched `status`, so clearing `deletedAt` is the whole restore. A published
 * item that was deleted by mistake goes straight back to being published, which
 * is what "undo" has to mean for the person who clicked delete on the wrong row.
 */
@Injectable()
export class RestorePostUseCase {
  private readonly logger = new Logger(RestorePostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, now: Date = new Date()) {
    const existing = await this.postRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
    }

    if (!existing.deletedAt) {
      throw new BadRequestException(
        'Konten ini tidak berada di tempat sampah.',
      );
    }

    const elapsedDays =
      (now.getTime() - existing.deletedAt.getTime()) / DAY_IN_MS;
    if (elapsedDays > RESTORE_WINDOW_DAYS) {
      throw new BadRequestException(
        `Konten hanya dapat dipulihkan dalam ${RESTORE_WINDOW_DAYS} hari setelah dihapus.`,
      );
    }

    const restored = await this.postRepository.restore(id);

    await this.cache.invalidate();

    this.logger.log(`Post restored to ${restored.status}: "${restored.title}"`);
    return toAdminDetail(restored);
  }
}
