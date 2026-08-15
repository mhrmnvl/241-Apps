import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GetHistoriesUseCase } from '../use-cases/get-histories.use-case.js';
import { HistoryQueryDto } from '../dto/request/history-query.dto.js';

@ApiTags('Inventory Asset History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/histories')
export class HistoryController {
  constructor(private readonly getHistoriesUseCase: GetHistoriesUseCase) {}

  @Get()
  @RequirePermissions('inventory-loans.read')
  @ApiOperation({ summary: 'List all asset circulation history logs' })
  async findAll(@Query() query: HistoryQueryDto) {
    return this.getHistoriesUseCase.execute(query);
  }
}
