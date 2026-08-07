import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostType } from '../domain/enums/post-type.enum.js';
import { postTypeFromPath } from '../constants/post.constants.js';
import { PublicPostQueryDto } from '../dto/request/public-post-query.dto.js';
import {
  PostDetailDto,
  PostSummaryDto,
} from '../dto/response/post-detail.dto.js';
import { GetPublicPostBySlugUseCase } from '../use-cases/get-public-post-by-slug.use-case.js';
import { GetPublicPostsUseCase } from '../use-cases/get-public-posts.use-case.js';
import { GetRelatedPostsUseCase } from '../use-cases/get-related-posts.use-case.js';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';

/**
 * Anonymous surface. Everything here sits under /portal/public so the whole
 * public API can be throttled, cached, or fronted by a CDN as one unit rather
 * than as a list of routes someone has to keep correct.
 */
const PUBLIC_POSTS_PATH = '/portal/public/posts';

@ApiTags('Portal — Public')
@Controller('portal/public/posts')
export class PostPublicController {
  constructor(
    private readonly getPublicPostsUseCase: GetPublicPostsUseCase,
    private readonly getPublicPostBySlugUseCase: GetPublicPostBySlugUseCase,
    private readonly getRelatedPostsUseCase: GetRelatedPostsUseCase,
  ) {}

  @Get()
  @PortalPublic()
  @ApiOperation({ summary: 'Published content listing, newest first' })
  @ApiResponse({ status: 200, type: [PostSummaryDto] })
  async findAll(@Query() query: PublicPostQueryDto) {
    return this.getPublicPostsUseCase.execute(query);
  }

  @Get(':type/:slug')
  @PortalPublic()
  @ApiParam({ name: 'type', enum: PostType })
  @ApiParam({ name: 'slug', example: 'juara-1-olimpiade-matematika' })
  @ApiOperation({ summary: 'Published content detail by public address' })
  @ApiResponse({ status: 200, type: PostDetailDto })
  @ApiResponse({
    status: 301,
    description: 'The address moved — Location carries the current one',
  })
  @ApiResponse({
    status: 404,
    description:
      'Unknown, draft, scheduled, archived, or deleted — identical in every case',
  })
  async findOne(
    @Param('type') type: string,
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const postType = assertPostType(type);
    const result = await this.getPublicPostBySlugUseCase.execute(
      postType,
      slug,
    );

    // 301, not 302: the move is permanent, and telling search engines so is
    // what consolidates the item's ranking on one address rather than splitting
    // it across the old one and the new (FR-066).
    if (result.kind === 'moved') {
      res.redirect(
        301,
        `${PUBLIC_POSTS_PATH}/${type.toLowerCase()}/${result.slug}`,
      );
      return undefined;
    }

    return result.post;
  }

  @Get(':type/:slug/related')
  @PortalPublic()
  @ApiParam({ name: 'type', enum: PostType })
  @ApiParam({ name: 'slug', example: 'juara-1-olimpiade-matematika' })
  @ApiOperation({ summary: 'Up to four more items like this one' })
  @ApiResponse({ status: 200, type: [PostSummaryDto] })
  @ApiResponse({ status: 404, description: 'Anchor is not publicly visible' })
  async findRelated(@Param('type') type: string, @Param('slug') slug: string) {
    return this.getRelatedPostsUseCase.execute(assertPostType(type), slug);
  }
}

/**
 * A URL segment that names no content type is exactly as absent as one that
 * names no article — same 404, no hint that the shape was nearly right.
 */
function assertPostType(segment: string): `${PostType}` {
  const type = postTypeFromPath(segment);
  if (!type) throw new NotFoundException('Halaman tidak ditemukan');
  return type;
}
