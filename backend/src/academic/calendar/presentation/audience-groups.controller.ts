import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { GetAudienceGroupsUseCase } from '../use-cases/get-audience-groups.use-case.js';

@ApiTags('Audience Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audience-groups')
export class AudienceGroupsController {
  constructor(
    private readonly getAudienceGroupsUseCase: GetAudienceGroupsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List audience groups' })
  async findAll() {
    const data = await this.getAudienceGroupsUseCase.execute();
    return { data };
  }
}
