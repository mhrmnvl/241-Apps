import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RUN_MESSAGES } from '../constants/payroll-run.constants.js';
import {
  PayrollRunWithTotals,
  PayslipNetChange,
  PreviousDraftComparison,
} from '../domain/entities/payroll-run.entity.js';
import {
  IPayrollRunRepository,
  PayslipNetSnapshot,
} from '../domain/interfaces/payroll-run-repository.interface.js';
import {
  PayrollRosterService,
  RosterMember,
} from '../services/payroll-roster.service.js';
import { PayslipComposerService } from '../services/payslip-composer.service.js';

export interface RecalculatedRun extends PayrollRunWithTotals {
  previousDraft: PreviousDraftComparison;
}

@Injectable()
export class RecalculatePayrollRunUseCase {
  constructor(
    private readonly runs: IPayrollRunRepository,
    private readonly roster: PayrollRosterService,
    private readonly composer: PayslipComposerService,
  ) {}

  /**
   * Recomputes a draft from current attendance and says what moved.
   *
   * The comparison is the point (FR-044). A recalculation that silently
   * replaced the figures would leave the operator no way to tell an intended
   * correction from an accident, on the one document nobody can afford to get
   * wrong.
   */
  async execute(id: string): Promise<RecalculatedRun> {
    const run = await this.runs.findRunById(id);
    if (!run) throw new NotFoundException(RUN_MESSAGES.NOT_FOUND);

    if (run.status === 'APPROVED') {
      throw new ConflictException(RUN_MESSAGES.APPROVED_TERMINAL);
    }
    if (run.status !== 'DRAFT') {
      throw new ConflictException(RUN_MESSAGES.DRAFT_ONLY);
    }

    const before = await this.runs.snapshotNets(id);
    const employees = await this.roster.list();

    const { payslips, unconfigured } = await this.composer.compose(
      employees.map((employee) => employee.userId),
      run.year,
      run.month,
    );

    if (unconfigured.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Pegawai berikut belum punya komponen gaji',
        employees: this.roster.name(employees, unconfigured),
      });
    }

    const recalculated = await this.runs.replacePayslips(id, payslips);

    return {
      ...recalculated,
      previousDraft: compare(before, payslips, employees),
    };
  }
}

function compare(
  before: PayslipNetSnapshot[],
  after: { userId: string; net: number }[],
  roster: RosterMember[],
): PreviousDraftComparison {
  const previousByUser = new Map(before.map((row) => [row.userId, row]));
  const nameByUser = new Map(
    roster.map((member) => [member.userId, member.displayName]),
  );
  const changed: PayslipNetChange[] = [];
  let previousTotal = 0;

  for (const row of before) previousTotal += Number(row.net);

  for (const payslip of after) {
    const previous = previousByUser.get(payslip.userId);
    const previousNet = previous ? Number(previous.net) : 0;
    if (previousNet === payslip.net) continue;

    changed.push({
      userId: payslip.userId,
      displayName:
        nameByUser.get(payslip.userId) ?? previous?.displayName ?? null,
      previousNet: String(previousNet),
      currentNet: String(payslip.net),
    });
  }

  return { net: String(previousTotal), changedPayslips: changed };
}
