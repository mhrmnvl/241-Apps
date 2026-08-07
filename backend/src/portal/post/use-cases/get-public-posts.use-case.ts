import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PublicPostQueryDto } from '../dto/request/public-post-query.dto.js';
import { PostSummaryDto } from '../dto/response/post-detail.dto.js';
import { toPublicSummary } from '../infrastructure/mappers/post.mapper.js';
import { DEFAULT_PAGE_SIZE } from '../constants/post.constants.js';

@Injectable()
export class GetPublicPostsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(
    query: PublicPostQueryDto,
  ): Promise<PaginatedResponse<PostSummaryDto>> {
    const { data, total, page, limit } = await this.postRepository.findPublic({
      page: query.page,
      limit: query.limit ?? DEFAULT_PAGE_SIZE,
      type: query.type,
      categorySlug: query.categorySlug,
      tagSlug: query.tagSlug,
      search: query.search,
      // Announcements default to the active view. The archive is a deliberate
      // second listing rather than a way to widen the current one — neither
      // scope can reach anything the visibility predicate excludes (FR-044).
      expiryScope: query.scope ?? 'active',
    });

    return {
      data: data.map(toPublicSummary),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
