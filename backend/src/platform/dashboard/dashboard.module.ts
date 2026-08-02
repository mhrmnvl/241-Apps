import { Module } from '@nestjs/common';
import { DashboardController } from './presentation/dashboard.controller.js';
import { PrismaDashboardRepository } from './infrastructure/persistence/prisma-dashboard.repository.js';
import { IDashboardRepository } from './domain/interfaces/dashboard-repository.interface.js';
import { GetDashboardSummaryUseCase } from './use-cases/get-dashboard-summary.use-case.js';

@Module({
  controllers: [DashboardController],
  providers: [
    { provide: IDashboardRepository, useClass: PrismaDashboardRepository },
    GetDashboardSummaryUseCase,
  ],
  exports: [IDashboardRepository],
})
export class DashboardModule {}
