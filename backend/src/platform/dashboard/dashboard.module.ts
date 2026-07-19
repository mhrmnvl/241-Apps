import { Module } from '@nestjs/common';
import { DashboardController } from './presentation/dashboard.controller.js';
import { DashboardRepository } from './repositories/dashboard.repository.js';
import { GetDashboardSummaryUseCase } from './use-cases/get-dashboard-summary.use-case.js';

@Module({
  controllers: [DashboardController],
  providers: [DashboardRepository, GetDashboardSummaryUseCase],
})
export class DashboardModule {}
