import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { GetDashboardSummaryService } from '../services/get-dashboard-summary.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryService: GetDashboardSummaryService,
  ) {}

  @Get('summary')
  @RequirePermissions('dashboards.read')
  async getSummary() {
    return this.getDashboardSummaryService.execute();
  }
}
