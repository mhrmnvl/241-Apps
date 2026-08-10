import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RUN_MESSAGES } from '../constants/payroll-run.constants.js';
import { PayrollRunWithTotals } from '../domain/entities/payroll-run.entity.js';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';

@Injectable()
export class ApprovePayrollRunUseCase {
  constructor(private readonly runs: IPayrollRunRepository) {}

  /**
   * `SUBMITTED → APPROVED`, and `APPROVED` is terminal.
   *
   * Every mutating path checks that terminal state and refuses, pointing at an
   * adjustment run instead (FR-049, FR-050). Editing an approved run would
   * change a figure someone has already been paid, leaving the payslip in their
   * hand disagreeing with the record — which is the one failure payroll cannot
   * absorb.
   */
  async execute(id: string, actorId: string): Promise<PayrollRunWithTotals> {
    const run = await this.runs.findRunById(id);
    if (!run) throw new NotFoundException(RUN_MESSAGES.NOT_FOUND);

    if (run.status === 'APPROVED') {
      throw new ConflictException(RUN_MESSAGES.APPROVED_TERMINAL);
    }
    if (run.status !== 'SUBMITTED') {
      throw new ConflictException(RUN_MESSAGES.APPROVE_FROM_SUBMITTED);
    }
    // Four eyes: the person who calculated the month does not also bless it.
    if (run.createdBy === actorId) {
      throw new ForbiddenException(RUN_MESSAGES.SELF_APPROVAL);
    }

    return this.runs.transition(id, {
      status: 'APPROVED',
      actorId,
      at: new Date(),
    });
  }
}
