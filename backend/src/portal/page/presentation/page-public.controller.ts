import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';
import { GetPublicNavigationUseCase } from '../use-cases/manage-navigation.use-cases.js';
import { GetPublicPageUseCase } from '../use-cases/get-public-page.use-case.js';

const PUBLIC_PAGES_PATH = '/portal/public/pages';

@ApiTags('Portal — Public')
@Controller('portal/public')
export class PagePublicController {
  constructor(
    private readonly getPublicPageUseCase: GetPublicPageUseCase,
    private readonly getPublicNavigationUseCase: GetPublicNavigationUseCase,
  ) {}

  /**
   * The menu, with entries pointing at unpublished pages omitted (FR-053).
   *
   * Filtering here rather than hiding the link in the frontend is what makes
   * unpublishing a page a complete action: the entry disappears everywhere on
   * the next request, and nobody has to remember to also edit the menu.
   */
  @Get('navigation')
  @PortalPublic()
  @ApiOperation({ summary: 'The public menu, in display order' })
  async navigation() {
    return this.getPublicNavigationUseCase.execute();
  }

  @Get('pages/:slug')
  @PortalPublic()
  @ApiParam({ name: 'slug', example: 'visi-misi' })
  @ApiOperation({ summary: 'A published informational page' })
  @ApiResponse({ status: 301, description: 'The address moved' })
  @ApiResponse({ status: 404, description: 'Unknown, draft, or deleted' })
  async findOne(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.getPublicPageUseCase.execute(slug);

    if (result.kind === 'moved') {
      res.redirect(301, `${PUBLIC_PAGES_PATH}/${result.slug}`);
      return undefined;
    }

    return result.page;
  }
}
