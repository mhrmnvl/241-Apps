import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import {
  GetHistoriesUseCase,
  HistoryQueryDto,
} from '../use-cases/get-histories.use-case.js';

@ApiTags('Inventory Asset History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/histories')
export class HistoryController {
  constructor(private readonly getHistoriesUseCase: GetHistoriesUseCase) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'List all asset circulation history logs' })
  async findAll(@Query() query: HistoryQueryDto) {
    return this.getHistoriesUseCase.execute(query);
  }
}
