import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollAuditService } from '../../shared/services/payroll-audit.service.js';
import { IPayslipRepository } from '../domain/interfaces/payslip-repository.interface.js';
import { GetMyPayslipUseCase } from './get-my-payslip.use-case.js';

const AHMAD = '11111111-1111-4111-8111-111111111111';

function payslip() {
  return {
    id: 'slip-1',
    run: {
      id: 'run-1',
      year: 2026,
      month: 7,
      kind: 'ORIGINAL',
      status: 'APPROVED',
    },
    employee: { userId: AHMAD, displayName: 'Ahmad', identifier: '198001' },
    net: '3500000',
  };
}

describe('GetMyPayslipUseCase', () => {
  let useCase: GetMyPayslipUseCase;
  const payslips = { findOwn: jest.fn() };
  const audit = { record: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyPayslipUseCase,
        { provide: IPayslipRepository, useValue: payslips },
        { provide: PayrollAuditService, useValue: audit },
      ],
    }).compile();

    useCase = module.get(GetMyPayslipUseCase);
    jest.clearAllMocks();
    audit.record.mockResolvedValue(undefined);
  });

  /**
   * FR-051. The identity comes from the token; there is no parameter here to
   * point at somebody else, which is the only reliable way to say so.
   */
  it('reads the caller from the token, never from input', async () => {
    payslips.findOwn.mockResolvedValue(payslip());

    await useCase.execute(AHMAD, { year: 2026, month: 7 });

    expect(payslips.findOwn).toHaveBeenCalledWith(AHMAD, {
      year: 2026,
      month: 7,
    });
  });

  it('records the read (FR-052)', async () => {
    payslips.findOwn.mockResolvedValue(payslip());

    await useCase.execute(AHMAD, {});

    expect(audit.record).toHaveBeenCalledWith(
      'payroll.payslip.read-own',
      AHMAD,
      'slip-1',
      expect.objectContaining({ runId: 'run-1' }),
    );
  });

  it('404s when no approved run covers the period', async () => {
    payslips.findOwn.mockResolvedValue(null);

    await expect(useCase.execute(AHMAD, {})).rejects.toThrow(NotFoundException);
    expect(audit.record).not.toHaveBeenCalled();
  });
});
