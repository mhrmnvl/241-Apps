import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { CreatePostDto } from '../dto/request/create-post.dto.js';
import { PostQueryDto } from '../dto/request/post-query.dto.js';
import { PinPostDto, PostVersionDto } from '../dto/request/post-version.dto.js';
import { PublishPostDto } from '../dto/request/publish-post.dto.js';
import { UpdatePostDto } from '../dto/request/update-post.dto.js';
import {
  PostAdminDetailDto,
  PostAdminSummaryDto,
} from '../dto/response/post-admin.dto.js';
import { PostDetailDto } from '../dto/response/post-detail.dto.js';
import { ArchivePostUseCase } from '../use-cases/archive-post.use-case.js';
import { CreatePostUseCase } from '../use-cases/create-post.use-case.js';
import { DeletePostUseCase } from '../use-cases/delete-post.use-case.js';
import { GetPostByIdUseCase } from '../use-cases/get-post-by-id.use-case.js';
import { GetPostsUseCase } from '../use-cases/get-posts.use-case.js';
import { PinPostUseCase } from '../use-cases/pin-post.use-case.js';
import { PreviewPostUseCase } from '../use-cases/preview-post.use-case.js';
import { PublishPostUseCase } from '../use-cases/publish-post.use-case.js';
import { RestorePostUseCase } from '../use-cases/restore-post.use-case.js';
import { UnpublishPostUseCase } from '../use-cases/unpublish-post.use-case.js';
import { UpdatePostUseCase } from '../use-cases/update-post.use-case.js';

@ApiTags('Portal — Content')
@ApiBearerAuth()
@Controller('portal/posts')
export class PostController {
  constructor(
    private readonly getPostsUseCase: GetPostsUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly publishPostUseCase: PublishPostUseCase,
    private readonly unpublishPostUseCase: UnpublishPostUseCase,
    private readonly archivePostUseCase: ArchivePostUseCase,
    private readonly pinPostUseCase: PinPostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly restorePostUseCase: RestorePostUseCase,
    private readonly previewPostUseCase: PreviewPostUseCase,
  ) {}

  @Get()
  @RequirePermissions('portal-posts.read')
  @ApiOperation({ summary: 'List portal content for management' })
  @ApiResponse({ status: 200, type: [PostAdminSummaryDto] })
  async findAll(@Query() query: PostQueryDto) {
    return this.getPostsUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('portal-posts.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Get one content item' })
  @ApiResponse({ status: 200, type: PostAdminDetailDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPostByIdUseCase.execute(id);
  }

  /**
   * FR-011. Renders through the public mapper, so what the editor checks is
   * what a visitor gets — a preview assembled from the admin shape would drift
   * the moment either changed.
   */
  @Get(':id/preview')
  @RequirePermissions('portal-posts.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'The item exactly as a visitor will see it' })
  @ApiResponse({ status: 200, type: PostDetailDto })
  async preview(@Param('id', ParseUUIDPipe) id: string) {
    return this.previewPostUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('portal-posts.create')
  @ApiOperation({ summary: 'Create content — always starts as a draft' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  @ApiResponse({
    status: 400,
    description: 'Type-specific field on wrong type',
  })
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createPostUseCase.execute(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('portal-posts.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({ status: 200, type: PostAdminDetailDto })
  @ApiResponse({ status: 409, description: 'Someone else saved first' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.updatePostUseCase.execute(id, dto);
  }

  // Publishing is gated separately from create/update, so writing and
  // publishing can belong to different people (FR-059).
  @Post(':id/publish')
  @RequirePermissions('portal-posts.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Publish now, or schedule for a future moment' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  @ApiResponse({ status: 400, description: 'Schedule is in the past' })
  @ApiResponse({ status: 422, description: 'Required fields still missing' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishPostDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publishPostUseCase.execute(id, dto, user.id);
  }

  // Unpublish, archive, and pin all sit behind `publish` rather than `update`:
  // each of them changes what a visitor sees, which is the boundary that
  // permission draws (FR-059).
  @Post(':id/unpublish')
  @RequirePermissions('portal-posts.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Take an item back off the public site' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  @ApiResponse({ status: 409, description: 'Someone else saved first' })
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PostVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.unpublishPostUseCase.execute(id, dto, user.id);
  }

  @Post(':id/archive')
  @RequirePermissions('portal-posts.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'File an item away, keeping its publication date' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PostVersionDto,
  ) {
    return this.archivePostUseCase.execute(id, dto);
  }

  @Post(':id/pin')
  @RequirePermissions('portal-posts.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Pin or unpin an item at the top of its feed' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  async pin(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PinPostDto) {
    return this.pinPostUseCase.execute(id, dto);
  }

  // Delete and restore are one permission, because they are one capability:
  // whoever can move something to the bin is who can take it back out.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-posts.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Soft delete — recoverable for 30 days' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.deletePostUseCase.execute(id, user.id);
  }

  @Post(':id/restore')
  @RequirePermissions('portal-posts.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Restore a deleted item to the state it was in' })
  @ApiResponse({ status: 201, type: PostAdminDetailDto })
  @ApiResponse({ status: 400, description: 'Past the 30-day window' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.restorePostUseCase.execute(id);
  }
}
