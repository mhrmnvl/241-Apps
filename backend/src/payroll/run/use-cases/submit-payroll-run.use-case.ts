import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RUN_MESSAGES } from '../constants/payroll-run.constants.js';
import { PayrollRunWithTotals } from '../domain/entities/payroll-run.entity.js';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';

@Injectable()
export class SubmitPayrollRunUseCase {
  constructor(private readonly runs: IPayrollRunRepository) {}

  /** `DRAFT → SUBMITTED`. Nothing else submits. */
  async execute(id: string, actorId: string): Promise<PayrollRunWithTotals> {
    const run = await this.runs.findRunById(id);
    if (!run) throw new NotFoundException(RUN_MESSAGES.NOT_FOUND);

    if (run.status === 'APPROVED') {
      throw new ConflictException(RUN_MESSAGES.APPROVED_TERMINAL);
    }
    if (run.status !== 'DRAFT') {
      throw new ConflictException(RUN_MESSAGES.SUBMIT_FROM_DRAFT);
    }

    return this.runs.transition(id, {
      status: 'SUBMITTED',
      actorId,
      at: new Date(),
    });
  }
}
