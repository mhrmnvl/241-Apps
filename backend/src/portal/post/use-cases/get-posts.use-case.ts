import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostQueryDto } from '../dto/request/post-query.dto.js';
import { PostAdminSummaryDto } from '../dto/response/post-admin.dto.js';
import { toAdminSummary } from '../infrastructure/mappers/post.mapper.js';
import { DEFAULT_PAGE_SIZE } from '../constants/post.constants.js';

@Injectable()
export class GetPostsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(
    query: PostQueryDto,
  ): Promise<PaginatedResponse<PostAdminSummaryDto>> {
    const { data, total, page, limit } = await this.postRepository.findAll({
      page: query.page,
      limit: query.limit ?? DEFAULT_PAGE_SIZE,
      type: query.type,
      status: query.status,
      categoryId: query.categoryId,
      search: query.search,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: data.map(toAdminSummary),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
