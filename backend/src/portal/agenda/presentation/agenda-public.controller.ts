import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';
import { PublicAgendaQueryDto } from '../dto/request/agenda.dto.js';
import {
  GetPublicAgendaBySlugUseCase,
  GetPublicAgendaUseCase,
} from '../use-cases/get-public-agenda.use-case.js';

@ApiTags('Portal — Public')
@Controller('portal/public/agenda')
export class AgendaPublicController {
  constructor(
    private readonly getPublicAgendaUseCase: GetPublicAgendaUseCase,
    private readonly getPublicAgendaBySlugUseCase: GetPublicAgendaBySlugUseCase,
  ) {}

  @Get()
  @PortalPublic()
  @ApiOperation({
    summary:
      'Upcoming (nearest first) or past (most recent first) school activities',
  })
  async findAll(@Query() query: PublicAgendaQueryDto) {
    return this.getPublicAgendaUseCase.execute(query);
  }

  @Get(':slug')
  @PortalPublic()
  @ApiParam({ name: 'slug', example: 'pentas-seni-akhir-tahun' })
  @ApiOperation({
    summary: 'One activity — reachable whether or not it has happened yet',
  })
  @ApiResponse({ status: 404, description: 'Unknown, draft, or deleted' })
  async findOne(@Param('slug') slug: string) {
    return this.getPublicAgendaBySlugUseCase.execute(slug);
  }
}
