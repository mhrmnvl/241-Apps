import { Injectable, NotFoundException } from '@nestjs/common';
import { RUN_MESSAGES } from '../constants/payroll-run.constants.js';
import { PayrollRunWithTotals } from '../domain/entities/payroll-run.entity.js';
import {
  IPayrollRunRepository,
  PayrollRunQueryInput,
} from '../domain/interfaces/payroll-run-repository.interface.js';

@Injectable()
export class GetPayrollRunsUseCase {
  constructor(private readonly runs: IPayrollRunRepository) {}

  async execute(query: PayrollRunQueryInput): Promise<PayrollRunWithTotals[]> {
    return this.runs.findAll(query);
  }
}

@Injectable()
export class GetPayrollRunByIdUseCase {
  constructor(private readonly runs: IPayrollRunRepository) {}

  async execute(id: string): Promise<PayrollRunWithTotals> {
    const run = await this.runs.findById(id);
    if (!run) throw new NotFoundException(RUN_MESSAGES.NOT_FOUND);

    return run;
  }
}
