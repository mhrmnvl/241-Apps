import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IAttendancePeriodRepository } from '../../../presence/attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { RUN_MESSAGES } from '../constants/payroll-run.constants.js';
import {
  PayrollRunKindEnum,
  PayrollRunWithTotals,
} from '../domain/entities/payroll-run.entity.js';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';
import { CreatePayrollRunDto } from '../dto/request/create-payroll-run.dto.js';
import { PayrollRosterService } from '../services/payroll-roster.service.js';
import { PayslipComposerService } from '../services/payslip-composer.service.js';

@Injectable()
export class CreatePayrollRunUseCase {
  constructor(
    private readonly runs: IPayrollRunRepository,
    private readonly periods: IAttendancePeriodRepository,
    private readonly roster: PayrollRosterService,
    private readonly composer: PayslipComposerService,
  ) {}

  /**
   * Calculates a month and writes it as a DRAFT run.
   *
   * Each precondition refuses with its own message rather than one generic
   * failure — the operator's next action differs completely between "close the
   * period first", "make this an adjustment", and "three people have no salary".
   */
  async execute(
    dto: CreatePayrollRunDto,
    createdBy: string,
  ): Promise<PayrollRunWithTotals> {
    const { year, month } = dto;
    const kind: PayrollRunKindEnum = dto.kind ?? 'ORIGINAL';

    // Running against an open month would pay figures that attendance
    // corrections can still move underneath it.
    if (!(await this.periods.isClosed(year, month))) {
      throw new ConflictException(RUN_MESSAGES.PERIOD_NOT_CLOSED);
    }

    await this.assertKindIsAvailable(year, month, kind);

    const employees = await this.roster.list();
    if (employees.length === 0) {
      throw new UnprocessableEntityException(RUN_MESSAGES.EMPTY_ROSTER);
    }

    const { payslips, unconfigured } = await this.composer.compose(
      employees.map((employee) => employee.userId),
      year,
      month,
    );

    // Refused rather than paid zero: a silent zero is indistinguishable from a
    // correct figure, and the person only finds out on payday.
    if (unconfigured.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Pegawai berikut belum punya komponen gaji',
        employees: this.roster.name(employees, unconfigured),
      });
    }

    return this.runs.create({
      year,
      month,
      kind,
      sequence: await this.runs.nextSequence(year, month, kind),
      note: dto.note ?? null,
      createdBy,
      payslips,
    });
  }

  private async assertKindIsAvailable(
    year: number,
    month: number,
    kind: PayrollRunKindEnum,
  ): Promise<void> {
    const original = await this.runs.findByPeriod(year, month, 'ORIGINAL');

    // A second ORIGINAL would give the month two competing authoritative
    // figures; a correction is an adjustment carried in its own run (FR-050).
    if (kind === 'ORIGINAL' && original) {
      throw new ConflictException(RUN_MESSAGES.ORIGINAL_EXISTS);
    }
    if (kind === 'ADJUSTMENT' && !original) {
      throw new ConflictException(RUN_MESSAGES.ORIGINAL_MISSING);
    }
  }
}
