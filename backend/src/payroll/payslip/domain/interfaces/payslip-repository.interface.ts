import {
  PayslipDetail,
  PayslipSummary,
} from '../entities/payslip-detail.entity.js';

export interface MyPayslipQueryInput {
  year?: number;
  month?: number;
}

export abstract class IPayslipRepository {
  abstract findByRun(runId: string): Promise<PayslipSummary[]>;
  abstract findById(id: string): Promise<PayslipDetail | null>;

  /**
   * The caller's own payslip for a month, or their latest.
   *
   * Restricted to **approved** runs: a draft is still being recalculated, and
   * an employee who has seen a figure that later moves has been misinformed by
   * the system rather than served by it.
   */
  abstract findOwn(
    userId: string,
    query: MyPayslipQueryInput,
  ): Promise<PayslipDetail | null>;

  /** Who a payslip belongs to — the ownership check for `read-own`. */
  abstract findOwnerId(id: string): Promise<string | null>;
}
