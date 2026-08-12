import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { BulkGenerateReportCardDto } from '../dto/request/bulk-generate-report-card.dto.js';
import { BulkGenerateReportCardResponseDto } from '../dto/response/bulk-generate-report-card-response.dto.js';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { UpdateReportCardDto } from '../dto/request/update-report-card.dto.js';
import { DeleteReportCardUseCase } from '../use-cases/delete-report-card.use-case.js';
import { BulkGenerateReportCardsUseCase } from '../use-cases/bulk-generate-report-cards.use-case.js';
import { GenerateReportCardUseCase } from '../use-cases/generate-report-card.use-case.js';
import { GetReportCardByIdUseCase } from '../use-cases/get-report-card-by-id.use-case.js';
import { GetReportCardsUseCase } from '../use-cases/get-report-cards.use-case.js';
import { PublishReportCardUseCase } from '../use-cases/publish-report-card.use-case.js';
import { UpdateReportCardUseCase } from '../use-cases/update-report-card.use-case.js';
import { ExportReportCardPdfUseCase } from '../use-cases/export-report-card-pdf.use-case.js';

@ApiTags('ReportCards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rapors')
export class ReportCardController {
  constructor(
    private readonly getReportCardsService: GetReportCardsUseCase,
    private readonly getReportCardByIdService: GetReportCardByIdUseCase,
    private readonly generateReportCardService: GenerateReportCardUseCase,
    private readonly bulkGenerateReportCardsService: BulkGenerateReportCardsUseCase,
    private readonly updateReportCardService: UpdateReportCardUseCase,
    private readonly publishReportCardService: PublishReportCardUseCase,
    private readonly deleteReportCardService: DeleteReportCardUseCase,
    private readonly exportReportCardPdfService: ExportReportCardPdfUseCase,
  ) {}

  @Get()
  @RequirePermissions('report-cards.read')
  @ApiOperation({ summary: 'List reportCards (paginated, filterable)' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportCardQueryDto,
  ) {
    return this.getReportCardsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('report-cards.read')
  @ApiOperation({ summary: 'Get reportCard by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getReportCardByIdService.execute(id);
  }

  @Post('generate')
  @RequirePermissions('report-cards.create')
  @ApiOperation({ summary: 'Generate reportCard for a student' })
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateReportCardDto,
  ) {
    return this.generateReportCardService.execute(dto);
  }

  @Post('generate/bulk')
  @RequirePermissions('report-cards.create')
  @ApiOperation({
    summary: 'Generate report cards for every active enrolment in a classroom',
    description:
      'Published cards are left untouched and reported as skipped, so one issued report does not block the rest of the class.',
  })
  @ApiResponse({ status: 201, type: BulkGenerateReportCardResponseDto })
  bulkGenerate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkGenerateReportCardDto,
  ) {
    return this.bulkGenerateReportCardsService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('report-cards.update')
  @ApiOperation({ summary: 'Update reportCard details' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportCardDto,
  ) {
    return this.updateReportCardService.execute(id, dto);
  }

  @Patch(':id/publish')
  @RequirePermissions('report-cards.publish')
  @ApiOperation({ summary: 'Publish a reportCard' })
  @ApiParam({ name: 'id', format: 'uuid' })
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.publishReportCardService.execute(id);
  }

  @Delete(':id')
  @RequirePermissions('report-cards.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a reportCard' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteReportCardService.execute(id);
  }

  @Get(':id/export')
  @RequirePermissions('report-cards.read')
  @ApiOperation({ summary: 'Export reportCard as PDF' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async exportPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.exportReportCardPdfService.execute(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=rapor-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
