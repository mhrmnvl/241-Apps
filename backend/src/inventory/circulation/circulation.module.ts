import { Module } from '@nestjs/common';
import { PrismaCirculationRepository } from './infrastructure/persistence/prisma-circulation.repository.js';
import { ICirculationRepository } from './domain/interfaces/circulation-repository.interface.js';
import { CreateLoanUseCase } from './use-cases/create-loan.use-case.js';
import { ReturnLoanUseCase } from './use-cases/return-loan.use-case.js';
import { GetLoansUseCase } from './use-cases/get-loans.use-case.js';
import { GetLoanByIdUseCase } from './use-cases/get-loan-by-id.use-case.js';
import { GetHistoriesUseCase } from './use-cases/get-histories.use-case.js';
import { LoanController } from './presentation/loan.controller.js';
import { HistoryController } from './presentation/history.controller.js';

@Module({
  controllers: [LoanController, HistoryController],
  providers: [
    { provide: ICirculationRepository, useClass: PrismaCirculationRepository },
    CreateLoanUseCase,
    ReturnLoanUseCase,
    GetLoansUseCase,
    GetLoanByIdUseCase,
    GetHistoriesUseCase,
  ],
  exports: [ICirculationRepository],
})
export class CirculationModule {}
