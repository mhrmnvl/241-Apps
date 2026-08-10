import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';
import { PayrollRosterService } from '../services/payroll-roster.service.js';
import { PayslipComposerService } from '../services/payslip-composer.service.js';
import { RecalculatePayrollRunUseCase } from './recalculate-payroll-run.use-case.js';

const AHMAD = '11111111-1111-4111-8111-111111111111';
const SITI = '22222222-2222-4222-8222-222222222222';

describe('RecalculatePayrollRunUseCase', () => {
  let useCase: RecalculatePayrollRunUseCase;
  const runs = {
    findRunById: jest.fn(),
    snapshotNets: jest.fn(),
    replacePayslips: jest.fn(),
  };
  const roster = { list: jest.fn(), name: jest.fn() };
  const composer = { compose: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecalculatePayrollRunUseCase,
        { provide: IPayrollRunRepository, useValue: runs },
        { provide: PayrollRosterService, useValue: roster },
        { provide: PayslipComposerService, useValue: composer },
      ],
    }).compile();

    useCase = module.get(RecalculatePayrollRunUseCase);
    jest.clearAllMocks();

    runs.findRunById.mockResolvedValue({
      id: 'run-1',
      year: 2026,
      month: 7,
      status: 'DRAFT',
    });
    runs.snapshotNets.mockResolvedValue([
      { userId: AHMAD, displayName: 'Ahmad', net: '3200000' },
      { userId: SITI, displayName: 'Siti', net: '2800000' },
    ]);
    runs.replacePayslips.mockResolvedValue({ id: 'run-1', totals: {} });
    roster.list.mockResolvedValue([
      { userId: AHMAD, displayName: 'Ahmad' },
      { userId: SITI, displayName: 'Siti' },
    ]);
    composer.compose.mockResolvedValue({
      payslips: [
        { userId: AHMAD, net: 3430000 },
        { userId: SITI, net: 2800000 },
      ],
      unconfigured: [],
    });
  });

  /**
   * FR-044. The comparison is the point: a recalculation that silently
   * replaced the figures would leave no way to tell an intended correction
   * from an accident.
   */
  it('reports only the payslips whose net moved', async () => {
    const result = await useCase.execute('run-1');

    expect(result.previousDraft.changedPayslips).toEqual([
      {
        userId: AHMAD,
        displayName: 'Ahmad',
        previousNet: '3200000',
        currentNet: '3430000',
      },
    ]);
    expect(result.previousDraft.net).toBe('6000000');
  });

  it('reads the previous nets before replacing them', async () => {
    await useCase.execute('run-1');

    expect(runs.snapshotNets.mock.invocationCallOrder[0]).toBeLessThan(
      runs.replacePayslips.mock.invocationCallOrder[0],
    );
  });

  it('refuses a submitted run', async () => {
    runs.findRunById.mockResolvedValue({ id: 'run-1', status: 'SUBMITTED' });

    await expect(useCase.execute('run-1')).rejects.toThrow(ConflictException);
    expect(runs.replacePayslips).not.toHaveBeenCalled();
  });

  it('refuses an approved run and points at an adjustment', async () => {
    runs.findRunById.mockResolvedValue({ id: 'run-1', status: 'APPROVED' });

    await expect(useCase.execute('run-1')).rejects.toThrow(/adjustment/i);
  });

  it('404s on a run that does not exist', async () => {
    runs.findRunById.mockResolvedValue(null);

    await expect(useCase.execute('run-1')).rejects.toThrow(NotFoundException);
  });
});
