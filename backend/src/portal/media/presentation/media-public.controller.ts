import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPublicMediaUseCase } from '../use-cases/get-public-media.use-case.js';
import { PortalPublicUncached } from '../../shared/decorators/portal-public.decorator.js';

@ApiTags('Portal — Public')
@Controller('portal/public/media')
export class MediaPublicController {
  constructor(private readonly getPublicMediaUseCase: GetPublicMediaUseCase) {}

  /**
   * A 302 rather than a proxied body: the API never streams the file, so a
   * busy gallery does not put the object bytes through the Node process.
   *
   * Deliberately not cached server-side. The signed URL behind the redirect
   * expires, so a cached redirect would start pointing at a dead credential —
   * the redirect must be minted fresh even though the address never changes.
   */
  @Get(':fileId')
  @PortalPublicUncached()
  @ApiParam({ name: 'fileId', format: 'uuid' })
  @ApiQuery({
    name: 'variant',
    required: false,
    enum: ['preview'],
    description:
      'preview returns the 1200×630 JPEG share card — this is what og:image points at, never the original',
  })
  @ApiOperation({ summary: 'Public file, if published content references it' })
  @ApiResponse({ status: 302, description: 'Redirect to a fresh signed URL' })
  @ApiResponse({
    status: 404,
    description:
      'No such file, or nothing public references it — identical in both cases',
  })
  async findOne(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
    @Query('variant') variant?: string,
  ) {
    const url = await this.getPublicMediaUseCase.execute(fileId, variant);
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(302, url);
  }
}
