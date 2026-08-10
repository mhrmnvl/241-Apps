import { Module } from '@nestjs/common';
import { IWorkPatternRepository } from './domain/interfaces/work-pattern-repository.interface.js';
import { PrismaWorkPatternRepository } from './infrastructure/persistence/prisma-work-pattern.repository.js';
import { WorkPatternController } from './presentation/work-pattern.controller.js';
import {
  AssignWorkPatternUseCase,
  BulkUpsertNonWorkingDaysUseCase,
  DeleteNonWorkingDayUseCase,
  GetNonWorkingDaysUseCase,
  GetWorkPatternAssignmentsUseCase,
  UpdateNonWorkingDayUseCase,
} from './use-cases/manage-non-working-days.use-case.js';
import {
  CreateWorkPatternUseCase,
  DeleteWorkPatternUseCase,
  GetWorkPatternsUseCase,
  ReplaceWorkPatternDaysUseCase,
  UpdateWorkPatternUseCase,
} from './use-cases/manage-work-pattern.use-case.js';

/**
 * Owns the working-pattern and non-working-day tables.
 *
 * Created in User Story 1 rather than User Story 4 because `daily-record` must
 * ask it what counts as late from the first scan onwards, and a module has to
 * exist before its first consumer. User Story 4 adds the management use cases
 * and controllers on top.
 */
@Module({
  controllers: [WorkPatternController],
  providers: [
    { provide: IWorkPatternRepository, useClass: PrismaWorkPatternRepository },
    GetWorkPatternsUseCase,
    CreateWorkPatternUseCase,
    UpdateWorkPatternUseCase,
    DeleteWorkPatternUseCase,
    ReplaceWorkPatternDaysUseCase,
    GetWorkPatternAssignmentsUseCase,
    AssignWorkPatternUseCase,
    GetNonWorkingDaysUseCase,
    BulkUpsertNonWorkingDaysUseCase,
    UpdateNonWorkingDayUseCase,
    DeleteNonWorkingDayUseCase,
  ],
  exports: [IWorkPatternRepository],
})
export class WorkPatternModule {}
