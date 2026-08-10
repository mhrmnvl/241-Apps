import { Test, TestingModule } from '@nestjs/testing';
import { IDailyPresenceReadPort } from '../../../presence/daily-record/domain/interfaces/daily-presence-read.port.js';
import { AttendanceDriverService } from './attendance-driver.service.js';
import { PayslipComposerService } from './payslip-composer.service.js';
import { RoundingService } from './rounding.service.js';
import { SalaryResolverService } from './salary-resolver.service.js';

const AHMAD = '11111111-1111-4111-8111-111111111111';
const SITI = '22222222-2222-4222-8222-222222222222';

function base(amount: string) {
  return {
    componentId: 'c-base',
    componentCode: 'GAJI_POKOK',
    componentName: 'Gaji Pokok',
    componentType: 'BASE' as const,
    driver: null,
    amount,
    rate: null,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function absenceDeduction(rate: string) {
  return {
    componentId: 'c-alpa',
    componentCode: 'POT_ALPA',
    componentName: 'Potongan Alpa',
    componentType: 'DEDUCTION' as const,
    driver: 'ABSENT_DAYS' as const,
    amount: null,
    rate,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function summary(userId: string, overrides: Record<string, number> = {}) {
  return {
    userId,
    presentDays: 20,
    absentDays: 0,
    lateCount: 0,
    lateMinutes: 0,
    earlyLeaveCount: 0,
    leaveDays: 0,
    officialDutyDays: 0,
    ...overrides,
  };
}

describe('PayslipComposerService', () => {
  let composer: PayslipComposerService;
  const resolver = { resolve: jest.fn(), unconfigured: jest.fn() };
  const presence = { summariseMonth: jest.fn(), findByUsersAndDate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayslipComposerService,
        RoundingService,
        AttendanceDriverService,
        { provide: SalaryResolverService, useValue: resolver },
        { provide: IDailyPresenceReadPort, useValue: presence },
      ],
    }).compile();

    composer = module.get(PayslipComposerService);
    jest.clearAllMocks();
    resolver.unconfigured.mockReturnValue([]);
  });

  it('multiplies a driven component by its attendance count', async () => {
    resolver.resolve.mockResolvedValue(
      new Map([[AHMAD, [base('3500000.00'), absenceDeduction('150000.00')]]]),
    );
    presence.summariseMonth.mockResolvedValue([
      summary(AHMAD, { absentDays: 2 }),
    ]);

    const { payslips } = await composer.compose([AHMAD], 2026, 7);
    const deduction = payslips[0].lines[1];

    expect(deduction.driverCount).toBe(2);
    expect(deduction.amount).toBe(300000);
    expect(payslips[0].net).toBe(3200000);
  });

  it('shows the count and rate behind every driven line (FR-045)', async () => {
    resolver.resolve.mockResolvedValue(
      new Map([[AHMAD, [absenceDeduction('150000.00')]]]),
    );
    presence.summariseMonth.mockResolvedValue([
      summary(AHMAD, { absentDays: 1 }),
    ]);

    const { payslips } = await composer.compose([AHMAD], 2026, 7);

    expect(payslips[0].lines[0]).toMatchObject({
      driver: 'ABSENT_DAYS',
      driverCount: 1,
      rate: '150000.00',
    });
  });

  it('carries no driver, count or rate on a fixed component', async () => {
    resolver.resolve.mockResolvedValue(
      new Map([[AHMAD, [base('3500000.00')]]]),
    );
    presence.summariseMonth.mockResolvedValue([summary(AHMAD)]);

    const { payslips } = await composer.compose([AHMAD], 2026, 7);

    expect(payslips[0].lines[0]).toMatchObject({
      driver: null,
      driverCount: null,
      rate: null,
      amount: 3500000,
    });
  });

  /**
   * FR-054. A month with no attendance rows must still produce a defensible
   * figure — the fixed pay stands and every driven count is zero.
   */
  it('pays an employee with no attendance rows at all', async () => {
    resolver.resolve.mockResolvedValue(
      new Map([[SITI, [base('3000000.00'), absenceDeduction('150000.00')]]]),
    );
    presence.summariseMonth.mockResolvedValue([]);

    const { payslips } = await composer.compose([SITI], 2026, 7);

    expect(payslips[0].attendance.presentDays).toBe(0);
    expect(payslips[0].lines[1].amount).toBe(0);
    expect(payslips[0].net).toBe(3000000);
  });

  it('reports who has no salary rather than composing a zero payslip', async () => {
    resolver.resolve.mockResolvedValue(new Map([[SITI, []]]));
    resolver.unconfigured.mockReturnValue([SITI]);

    const result = await composer.compose([SITI], 2026, 7);

    expect(result.payslips).toEqual([]);
    expect(result.unconfigured).toEqual([SITI]);
    expect(presence.summariseMonth).not.toHaveBeenCalled();
  });

  /**
   * SC-015 restated at the composition level: what the lines say must equal
   * what the totals say, or the payslip cannot be defended to the person
   * holding it.
   */
  it('reconciles: gross − deductions = net, from the rounded lines', async () => {
    resolver.resolve.mockResolvedValue(
      new Map([[AHMAD, [base('3333333.33'), absenceDeduction('333333.33')]]]),
    );
    presence.summariseMonth.mockResolvedValue([
      summary(AHMAD, { absentDays: 1 }),
    ]);

    const [payslip] = (await composer.compose([AHMAD], 2026, 7)).payslips;
    const sum = (type: string) =>
      payslip.lines
        .filter((line) =>
          type === 'DEDUCTION'
            ? line.componentType === 'DEDUCTION'
            : line.componentType !== 'DEDUCTION',
        )
        .reduce((total, line) => total + line.amount, 0);

    expect(sum('GROSS')).toBe(payslip.gross);
    expect(sum('DEDUCTION')).toBe(payslip.deductions);
    expect(payslip.gross - payslip.deductions).toBe(payslip.net);
  });
});
