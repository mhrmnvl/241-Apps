import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller.js';
import { DashboardRepository } from './repositories/dashboard.repository.js';
import { GetDashboardSummaryService } from './services/get-dashboard-summary.service.js';

@Module({
  controllers: [DashboardController],
  providers: [DashboardRepository, GetDashboardSummaryService],
})
export class DashboardModule {}
