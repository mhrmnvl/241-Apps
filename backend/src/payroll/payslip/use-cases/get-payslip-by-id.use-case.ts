import { Injectable, NotFoundException } from '@nestjs/common';
import { PayrollAuditService } from '../../shared/services/payroll-audit.service.js';
import {
  PayslipDetail,
  PayslipSummary,
} from '../domain/entities/payslip-detail.entity.js';
import { IPayslipRepository } from '../domain/interfaces/payslip-repository.interface.js';

@Injectable()
export class GetPayslipByIdUseCase {
  constructor(
    private readonly payslips: IPayslipRepository,
    private readonly audit: PayrollAuditService,
  ) {}

  /**
   * Somebody else's payslip, for the people whose job that is.
   *
   * Guarded by the broader `payroll-payslips.read`; a `read-own` holder never
   * reaches this use case, and their refusal is recorded by the filter on the
   * controller. Every read that does succeed is recorded here, because a trail
   * that only contains failures says nothing about who saw what (FR-052).
   */
  async execute(id: string, actorId: string): Promise<PayslipDetail> {
    const payslip = await this.payslips.findById(id);
    if (!payslip) throw new NotFoundException('Slip gaji tidak ditemukan');

    await this.audit.record('payroll.payslip.read', actorId, id, {
      owner: payslip.employee.userId,
      runId: payslip.run.id,
    });

    return payslip;
  }
}

@Injectable()
export class GetRunPayslipsUseCase {
  constructor(
    private readonly payslips: IPayslipRepository,
    private readonly audit: PayrollAuditService,
  ) {}

  async execute(runId: string, actorId: string): Promise<PayslipSummary[]> {
    const payslips = await this.payslips.findByRun(runId);

    await this.audit.record('payroll.payslip.read', actorId, runId, {
      scope: 'run',
      count: payslips.length,
    });

    return payslips;
  }
}
