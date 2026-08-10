import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAttendancePeriodRepository } from '../../../presence/attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';
import { PayrollRosterService } from '../services/payroll-roster.service.js';
import { PayslipComposerService } from '../services/payslip-composer.service.js';
import { CreatePayrollRunUseCase } from './create-payroll-run.use-case.js';

const OPERATOR = '99999999-9999-4999-8999-999999999999';
const AHMAD = '11111111-1111-4111-8111-111111111111';

describe('CreatePayrollRunUseCase', () => {
  let useCase: CreatePayrollRunUseCase;
  const runs = {
    findByPeriod: jest.fn(),
    nextSequence: jest.fn(),
    create: jest.fn(),
  };
  const periods = { isClosed: jest.fn() };
  const roster = { list: jest.fn(), name: jest.fn() };
  const composer = { compose: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePayrollRunUseCase,
        { provide: IPayrollRunRepository, useValue: runs },
        { provide: IAttendancePeriodRepository, useValue: periods },
        { provide: PayrollRosterService, useValue: roster },
        { provide: PayslipComposerService, useValue: composer },
      ],
    }).compile();

    useCase = module.get(CreatePayrollRunUseCase);
    jest.clearAllMocks();

    periods.isClosed.mockResolvedValue(true);
    runs.findByPeriod.mockResolvedValue(null);
    runs.nextSequence.mockResolvedValue(1);
    runs.create.mockImplementation((input: unknown) => ({
      id: 'run-1',
      input,
    }));
    roster.list.mockResolvedValue([{ userId: AHMAD, displayName: 'Ahmad' }]);
    roster.name.mockReturnValue(['Ahmad']);
    composer.compose.mockResolvedValue({
      payslips: [{ userId: AHMAD, net: 3500000 }],
      unconfigured: [],
    });
  });

  it('writes a DRAFT run for a closed month', async () => {
    await useCase.execute({ year: 2026, month: 7 }, OPERATOR);

    expect(runs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2026,
        month: 7,
        kind: 'ORIGINAL',
        sequence: 1,
        createdBy: OPERATOR,
      }),
    );
  });

  /**
   * Running against an open month would pay figures that attendance
   * corrections can still move underneath it.
   */
  it('refuses while the attendance period is still open', async () => {
    periods.isClosed.mockResolvedValue(false);

    await expect(
      useCase.execute({ year: 2026, month: 7 }, OPERATOR),
    ).rejects.toThrow(ConflictException);
    expect(runs.create).not.toHaveBeenCalled();
  });

  it('refuses a second ORIGINAL run and points at an adjustment', async () => {
    runs.findByPeriod.mockResolvedValue({ id: 'run-0', status: 'APPROVED' });

    await expect(
      useCase.execute({ year: 2026, month: 7 }, OPERATOR),
    ).rejects.toThrow(/adjustment/i);
  });

  it('refuses an ADJUSTMENT when the month has no ORIGINAL', async () => {
    await expect(
      useCase.execute({ year: 2026, month: 7, kind: 'ADJUSTMENT' }, OPERATOR),
    ).rejects.toThrow(ConflictException);
  });

  it('allows an ADJUSTMENT once an ORIGINAL exists', async () => {
    runs.findByPeriod.mockResolvedValue({ id: 'run-0' });
    runs.nextSequence.mockResolvedValue(2);

    await useCase.execute(
      { year: 2026, month: 7, kind: 'ADJUSTMENT' },
      OPERATOR,
    );

    expect(runs.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'ADJUSTMENT', sequence: 2 }),
    );
  });

  /**
   * A silent zero is indistinguishable from a correct figure on a payslip, and
   * the person only finds out on payday — so the run refuses and names them.
   */
  it('names employees with no salary rather than paying them zero', async () => {
    composer.compose.mockResolvedValue({ payslips: [], unconfigured: [AHMAD] });

    await expect(
      useCase.execute({ year: 2026, month: 7 }, OPERATOR),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(roster.name).toHaveBeenCalledWith(expect.anything(), [AHMAD]);
    expect(runs.create).not.toHaveBeenCalled();
  });

  it('refuses an empty roster instead of writing a run with no payslips', async () => {
    roster.list.mockResolvedValue([]);

    await expect(
      useCase.execute({ year: 2026, month: 7 }, OPERATOR),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
