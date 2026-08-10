import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPayrollRunRepository } from '../domain/interfaces/payroll-run-repository.interface.js';
import { PayrollRosterService } from '../services/payroll-roster.service.js';
import { PayslipComposerService } from '../services/payslip-composer.service.js';
import { ApprovePayrollRunUseCase } from './approve-payroll-run.use-case.js';
import { RecalculatePayrollRunUseCase } from './recalculate-payroll-run.use-case.js';
import { SubmitPayrollRunUseCase } from './submit-payroll-run.use-case.js';

const TU = '11111111-1111-4111-8111-111111111111';
const KEPALA = '22222222-2222-4222-8222-222222222222';

function approvedRun() {
  return {
    id: 'run-1',
    year: 2026,
    month: 7,
    status: 'APPROVED',
    createdBy: TU,
  };
}

describe('Payroll run approval', () => {
  let approve: ApprovePayrollRunUseCase;
  let submit: SubmitPayrollRunUseCase;
  let recalculate: RecalculatePayrollRunUseCase;

  const runs = {
    findRunById: jest.fn(),
    transition: jest.fn(),
    snapshotNets: jest.fn(),
    replacePayslips: jest.fn(),
  };
  const roster = { list: jest.fn(), name: jest.fn() };
  const composer = { compose: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovePayrollRunUseCase,
        SubmitPayrollRunUseCase,
        RecalculatePayrollRunUseCase,
        { provide: IPayrollRunRepository, useValue: runs },
        { provide: PayrollRosterService, useValue: roster },
        { provide: PayslipComposerService, useValue: composer },
      ],
    }).compile();

    approve = module.get(ApprovePayrollRunUseCase);
    submit = module.get(SubmitPayrollRunUseCase);
    recalculate = module.get(RecalculatePayrollRunUseCase);
    jest.clearAllMocks();
    runs.transition.mockResolvedValue({ id: 'run-1' });
  });

  describe('the DRAFT → SUBMITTED → APPROVED machine', () => {
    it('submits a draft', async () => {
      runs.findRunById.mockResolvedValue({ id: 'run-1', status: 'DRAFT' });

      await submit.execute('run-1', TU);

      expect(runs.transition).toHaveBeenCalledWith(
        'run-1',
        expect.objectContaining({ status: 'SUBMITTED', actorId: TU }),
      );
    });

    it('approves a submitted run', async () => {
      runs.findRunById.mockResolvedValue({
        id: 'run-1',
        status: 'SUBMITTED',
        createdBy: TU,
      });

      await approve.execute('run-1', KEPALA);

      expect(runs.transition).toHaveBeenCalledWith(
        'run-1',
        expect.objectContaining({ status: 'APPROVED', actorId: KEPALA }),
      );
    });

    it('refuses to approve a run that was never submitted', async () => {
      runs.findRunById.mockResolvedValue({
        id: 'run-1',
        status: 'DRAFT',
        createdBy: TU,
      });

      await expect(approve.execute('run-1', KEPALA)).rejects.toThrow(
        ConflictException,
      );
    });

    it('404s on a run that does not exist', async () => {
      runs.findRunById.mockResolvedValue(null);

      await expect(approve.execute('run-1', KEPALA)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Four eyes. Collapsed into one person, the separation of `payroll-runs.create`
   * from `payroll-runs.approve` buys nothing.
   */
  it('refuses approval by the person who created the run', async () => {
    runs.findRunById.mockResolvedValue({
      id: 'run-1',
      status: 'SUBMITTED',
      createdBy: TU,
    });

    await expect(approve.execute('run-1', TU)).rejects.toThrow(
      ForbiddenException,
    );
    expect(runs.transition).not.toHaveBeenCalled();
  });

  /**
   * FR-049 and FR-050: `APPROVED` is terminal on **every** mutating path.
   *
   * Editing an approved run would change a figure someone has already been
   * paid, leaving the payslip in their hand disagreeing with the record. Each
   * path is asserted separately because each is a separate place to forget.
   */
  describe('APPROVED is terminal', () => {
    beforeEach(() => runs.findRunById.mockResolvedValue(approvedRun()));

    it('refuses a second approval', async () => {
      await expect(approve.execute('run-1', KEPALA)).rejects.toThrow(
        /adjustment/i,
      );
    });

    it('refuses re-submission', async () => {
      await expect(submit.execute('run-1', TU)).rejects.toThrow(/adjustment/i);
    });

    it('refuses recalculation', async () => {
      await expect(recalculate.execute('run-1')).rejects.toThrow(/adjustment/i);
      expect(runs.replacePayslips).not.toHaveBeenCalled();
    });

    it('never writes on any of them', () => {
      expect(runs.transition).not.toHaveBeenCalled();
    });
  });
});
