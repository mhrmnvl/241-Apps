import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';
import { PublicAlbumQueryDto } from '../dto/request/gallery.dto.js';
import {
  GetPublicAlbumBySlugUseCase,
  GetPublicAlbumsUseCase,
} from '../use-cases/get-public-album.use-case.js';

@ApiTags('Portal — Public')
@Controller('portal/public/albums')
export class GalleryPublicController {
  constructor(
    private readonly getPublicAlbumsUseCase: GetPublicAlbumsUseCase,
    private readonly getPublicAlbumBySlugUseCase: GetPublicAlbumBySlugUseCase,
  ) {}

  @Get()
  @PortalPublic()
  @ApiOperation({ summary: 'Published albums, newest event first' })
  async findAll(@Query() query: PublicAlbumQueryDto) {
    return this.getPublicAlbumsUseCase.execute(query);
  }

  @Get(':slug')
  @PortalPublic()
  @ApiParam({ name: 'slug', example: 'pentas-seni-2026' })
  @ApiOperation({
    summary: 'One album with its photos paginated for progressive loading',
  })
  @ApiResponse({ status: 404, description: 'Unknown, draft, or deleted' })
  async findOne(
    @Param('slug') slug: string,
    @Query() query: PublicAlbumQueryDto,
  ) {
    return this.getPublicAlbumBySlugUseCase.execute(slug, query);
  }
}
