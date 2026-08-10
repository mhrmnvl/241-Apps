import { Module } from '@nestjs/common';
import { CredentialModule } from '../credential/credential.module.js';
import { WorkPatternModule } from '../work-pattern/work-pattern.module.js';
import { ILeaveRepository } from './domain/interfaces/leave-repository.interface.js';
import { PrismaLeaveRepository } from './infrastructure/persistence/prisma-leave.repository.js';
import { LeaveController } from './presentation/leave.controller.js';
import { LeaveTypeController } from './presentation/leave-type.controller.js';
import { WorkingDayExpanderService } from './services/working-day-expander.service.js';
import {
  ApproveLeaveRequestUseCase,
  RejectLeaveRequestUseCase,
  WithdrawLeaveRequestUseCase,
} from './use-cases/decide-leave-request.use-case.js';
import {
  CreateLeaveTypeUseCase,
  DeleteLeaveTypeUseCase,
  GetLeaveBalancesUseCase,
  GetLeaveRequestsUseCase,
  GetLeaveTypesUseCase,
  UpdateLeaveTypeUseCase,
} from './use-cases/manage-leave-types.use-case.js';
import { RecordStudentExcusedAbsenceUseCase } from './use-cases/record-student-excused-absence.use-case.js';
import { SubmitLeaveRequestUseCase } from './use-cases/submit-leave-request.use-case.js';

/**
 * Depends on `work-pattern` to know which days in a range are working days, and
 * on `credential` to know whether the requester is a student or an employee —
 * presence never asks `academic/` who anyone is (ADR-0007).
 */
@Module({
  imports: [WorkPatternModule, CredentialModule],
  controllers: [LeaveTypeController, LeaveController],
  providers: [
    { provide: ILeaveRepository, useClass: PrismaLeaveRepository },
    WorkingDayExpanderService,
    GetLeaveTypesUseCase,
    CreateLeaveTypeUseCase,
    UpdateLeaveTypeUseCase,
    DeleteLeaveTypeUseCase,
    GetLeaveRequestsUseCase,
    SubmitLeaveRequestUseCase,
    ApproveLeaveRequestUseCase,
    RejectLeaveRequestUseCase,
    WithdrawLeaveRequestUseCase,
    GetLeaveBalancesUseCase,
    RecordStudentExcusedAbsenceUseCase,
  ],
  exports: [ILeaveRepository],
})
export class LeaveModule {}
