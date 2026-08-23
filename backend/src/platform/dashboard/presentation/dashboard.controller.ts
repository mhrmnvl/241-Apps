import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { DashboardSummaryResponseDto } from '../dto/response/dashboard-summary-response.dto.js';
import { GetDashboardSummaryUseCase } from '../use-cases/get-dashboard-summary.use-case.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryService: GetDashboardSummaryUseCase,
  ) {}

  @Get('summary')
  @RequirePermissions('dashboards.read')
  @ApiResponse({ status: 200, type: DashboardSummaryResponseDto })
  async getSummary() {
    return this.getDashboardSummaryService.execute();
  }
}
