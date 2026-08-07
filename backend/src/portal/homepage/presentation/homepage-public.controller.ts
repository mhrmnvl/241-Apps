import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomepageResponseDto } from '../dto/response/homepage-response.dto.js';
import { PageMetaDto, SitemapEntryDto } from '../dto/response/page-meta.dto.js';
import { GetHomepageUseCase } from '../use-cases/get-homepage.use-case.js';
import { GetPageMetaUseCase } from '../use-cases/get-page-meta.use-case.js';
import { GetSitemapUseCase } from '../use-cases/get-sitemap.use-case.js';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';

@ApiTags('Portal — Public')
@Controller('portal/public/homepage')
export class HomepagePublicController {
  constructor(private readonly getHomepageUseCase: GetHomepageUseCase) {}

  @Get()
  @PortalPublic()
  @ApiOperation({
    summary: 'Everything the public homepage renders, in one round trip',
  })
  @ApiResponse({ status: 200, type: HomepageResponseDto })
  async get() {
    return this.getHomepageUseCase.execute();
  }
}

/**
 * Discoverability. Separate controller from the homepage because these answer
 * to different addresses and have different consumers — the metadata endpoint
 * is called by the backend's own HTML layer, the sitemap by search engines.
 */
@ApiTags('Portal — Public')
@Controller('portal/public')
export class PortalDiscoveryController {
  constructor(
    private readonly getPageMetaUseCase: GetPageMetaUseCase,
    private readonly getSitemapUseCase: GetSitemapUseCase,
  ) {}

  @Get('meta')
  @PortalPublic()
  @ApiQuery({ name: 'path', example: '/berita/juara-1-olimpiade' })
  @ApiOperation({ summary: 'Link-preview metadata for a public portal path' })
  @ApiResponse({ status: 200, type: PageMetaDto })
  @ApiResponse({
    status: 404,
    description: 'Resolves to nothing public — caller falls back to defaults',
  })
  async meta(@Query('path') path: string) {
    return this.getPageMetaUseCase.execute(path ?? '/');
  }

  @Get('sitemap')
  @PortalPublic()
  @ApiOperation({
    summary: 'Every publicly visible item with its lastModified',
  })
  @ApiResponse({ status: 200, type: [SitemapEntryDto] })
  async sitemap() {
    return this.getSitemapUseCase.execute();
  }
}
