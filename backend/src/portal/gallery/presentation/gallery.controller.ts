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
import {
  AddPhotoDto,
  AlbumQueryDto,
  AlbumVersionDto,
  CreateAlbumDto,
  PublishAlbumDto,
  ReorderPhotosDto,
  UpdateAlbumDto,
  UpdatePhotoDto,
} from '../dto/request/gallery.dto.js';
import {
  CreateAlbumUseCase,
  DeleteAlbumUseCase,
  GetAlbumByIdUseCase,
  GetAlbumsUseCase,
  PublishAlbumUseCase,
  UnpublishAlbumUseCase,
  UpdateAlbumUseCase,
} from '../use-cases/manage-album.use-cases.js';
import {
  AddPhotoUseCase,
  RemovePhotoUseCase,
  ReorderPhotosUseCase,
  UpdatePhotoUseCase,
} from '../use-cases/manage-photo.use-cases.js';

@ApiTags('Portal — Content')
@ApiBearerAuth()
@Controller('portal/albums')
export class GalleryController {
  constructor(
    private readonly getAlbumsUseCase: GetAlbumsUseCase,
    private readonly getAlbumByIdUseCase: GetAlbumByIdUseCase,
    private readonly createAlbumUseCase: CreateAlbumUseCase,
    private readonly updateAlbumUseCase: UpdateAlbumUseCase,
    private readonly publishAlbumUseCase: PublishAlbumUseCase,
    private readonly unpublishAlbumUseCase: UnpublishAlbumUseCase,
    private readonly deleteAlbumUseCase: DeleteAlbumUseCase,
    private readonly addPhotoUseCase: AddPhotoUseCase,
    private readonly updatePhotoUseCase: UpdatePhotoUseCase,
    private readonly removePhotoUseCase: RemovePhotoUseCase,
    private readonly reorderPhotosUseCase: ReorderPhotosUseCase,
  ) {}

  @Get()
  @RequirePermissions('portal-albums.read')
  @ApiOperation({ summary: 'Albums for management' })
  async findAll(@Query() query: AlbumQueryDto) {
    return this.getAlbumsUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('portal-albums.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAlbumByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('portal-albums.create')
  @ApiOperation({ summary: 'Create an album — always starts as a draft' })
  async create(
    @Body() dto: CreateAlbumDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createAlbumUseCase.execute(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('portal-albums.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.updateAlbumUseCase.execute(id, dto);
  }

  // Photos sit behind `update` rather than a permission of their own: adding a
  // photo is editing the album, and splitting them would be one more thing to
  // grant with no case where you would want one without the other.
  @Post(':id/photos')
  @RequirePermissions('portal-albums.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Add a photo — alt text required (FR-057)' })
  async addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPhotoDto,
  ) {
    return this.addPhotoUseCase.execute(id, dto);
  }

  @Patch(':id/photos/order')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-albums.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Reorder — position is the array index (FR-048)' })
  async reorderPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderPhotosDto,
  ) {
    await this.reorderPhotosUseCase.execute(id, dto);
  }

  @Patch(':id/photos/:photoId')
  @RequirePermissions('portal-albums.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'photoId', format: 'uuid' })
  @ApiOperation({ summary: 'Edit a photo caption or its alt text (FR-048)' })
  async updatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Body() dto: UpdatePhotoDto,
  ) {
    return this.updatePhotoUseCase.execute(id, photoId, dto);
  }

  @Delete(':id/photos/:photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-albums.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiParam({ name: 'photoId', format: 'uuid' })
  async removePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    await this.removePhotoUseCase.execute(id, photoId);
  }

  @Post(':id/publish')
  @RequirePermissions('portal-albums.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 422, description: 'The album has no photos' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishAlbumDto,
  ) {
    return this.publishAlbumUseCase.execute(id, dto);
  }

  @Post(':id/unpublish')
  @RequirePermissions('portal-albums.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary: 'Take the album down — every photo stops being fetchable',
  })
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AlbumVersionDto,
  ) {
    return this.unpublishAlbumUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-albums.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAlbumUseCase.execute(id);
  }
}
