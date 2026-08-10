import { Injectable, NotFoundException } from '@nestjs/common';
import { PayrollAuditService } from '../../shared/services/payroll-audit.service.js';
import { PayslipDetail } from '../domain/entities/payslip-detail.entity.js';
import {
  IPayslipRepository,
  MyPayslipQueryInput,
} from '../domain/interfaces/payslip-repository.interface.js';

@Injectable()
export class GetMyPayslipUseCase {
  constructor(
    private readonly payslips: IPayslipRepository,
    private readonly audit: PayrollAuditService,
  ) {}

  /**
   * The caller's own payslip.
   *
   * The user id comes from the authenticated request, not from a parameter —
   * there is nothing here to point at somebody else (FR-051). Approved runs
   * only, so nobody is shown a figure a recalculation can still move.
   */
  async execute(
    userId: string,
    query: MyPayslipQueryInput,
  ): Promise<PayslipDetail> {
    const payslip = await this.payslips.findOwn(userId, query);
    if (!payslip) {
      throw new NotFoundException(
        'Belum ada slip gaji yang disetujui untuk periode ini',
      );
    }

    await this.audit.record('payroll.payslip.read-own', userId, payslip.id, {
      runId: payslip.run.id,
      year: payslip.run.year,
      month: payslip.run.month,
    });

    return payslip;
  }
}
