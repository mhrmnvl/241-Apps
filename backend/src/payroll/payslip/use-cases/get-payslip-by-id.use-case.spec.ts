import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollAuditService } from '../../shared/services/payroll-audit.service.js';
import { IPayslipRepository } from '../domain/interfaces/payslip-repository.interface.js';
import {
  GetPayslipByIdUseCase,
  GetRunPayslipsUseCase,
} from './get-payslip-by-id.use-case.js';

const AHMAD = '11111111-1111-4111-8111-111111111111';
const BENDAHARA = '33333333-3333-4333-8333-333333333333';

describe('Payslip reads for other people', () => {
  let byId: GetPayslipByIdUseCase;
  let forRun: GetRunPayslipsUseCase;
  const payslips = { findById: jest.fn(), findByRun: jest.fn() };
  const audit = { record: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPayslipByIdUseCase,
        GetRunPayslipsUseCase,
        { provide: IPayslipRepository, useValue: payslips },
        { provide: PayrollAuditService, useValue: audit },
      ],
    }).compile();

    byId = module.get(GetPayslipByIdUseCase);
    forRun = module.get(GetRunPayslipsUseCase);
    jest.clearAllMocks();
    audit.record.mockResolvedValue(undefined);
  });

  /**
   * FR-052. A trail containing only refusals says nothing about who saw what,
   * so a granted read is recorded as deliberately as a denied one.
   */
  it('records who read whose payslip', async () => {
    payslips.findById.mockResolvedValue({
      id: 'slip-1',
      run: { id: 'run-1' },
      employee: { userId: AHMAD },
    });

    await byId.execute('slip-1', BENDAHARA);

    expect(audit.record).toHaveBeenCalledWith(
      'payroll.payslip.read',
      BENDAHARA,
      'slip-1',
      expect.objectContaining({ owner: AHMAD, runId: 'run-1' }),
    );
  });

  it('404s on an unknown payslip without recording a read', async () => {
    payslips.findById.mockResolvedValue(null);

    await expect(byId.execute('slip-1', BENDAHARA)).rejects.toThrow(
      NotFoundException,
    );
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('records a whole run being read, with its size', async () => {
    payslips.findByRun.mockResolvedValue([{ id: 'slip-1' }, { id: 'slip-2' }]);

    const result = await forRun.execute('run-1', BENDAHARA);

    expect(result).toHaveLength(2);
    expect(audit.record).toHaveBeenCalledWith(
      'payroll.payslip.read',
      BENDAHARA,
      'run-1',
      expect.objectContaining({ scope: 'run', count: 2 }),
    );
  });
});
