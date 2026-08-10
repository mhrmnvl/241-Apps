import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuditLogUseCase } from '../../../platform/audit-log/use-cases/create-audit-log.use-case.js';
import {
  PAYROLL_AUDIT_RESOURCE,
  PayrollAuditService,
} from './payroll-audit.service.js';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('PayrollAuditService', () => {
  let service: PayrollAuditService;
  const createAuditLog = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollAuditService,
        { provide: CreateAuditLogUseCase, useValue: createAuditLog },
      ],
    }).compile();

    service = module.get(PayrollAuditService);
    jest.clearAllMocks();
  });

  it('writes onto the existing AuditLog, not a payroll-specific table', async () => {
    createAuditLog.execute.mockResolvedValue({});

    await service.record('payroll.payslip.read', ACTOR, 'slip-1', { a: 1 });

    expect(createAuditLog.execute).toHaveBeenCalledWith({
      userId: ACTOR,
      action: 'payroll.payslip.read',
      resource: PAYROLL_AUDIT_RESOURCE,
      resourceId: 'slip-1',
      metadata: { a: 1 },
    });
  });

  /**
   * The read it describes already happened. Throwing here would report failure
   * for something that demonstrably took place — same policy as
   * `PostAuditService`, restated because here the trail is the control.
   */
  it('does not fail the operation when the audit write fails', async () => {
    createAuditLog.execute.mockRejectedValue(new Error('audit table down'));

    await expect(
      service.record('payroll.payslip.denied', ACTOR, 'slip-1'),
    ).resolves.toBeUndefined();
  });

  it('records a refusal by an unauthenticated caller', async () => {
    createAuditLog.execute.mockResolvedValue({});

    await service.record('payroll.payslip.denied', null, null);

    expect(createAuditLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null, resourceId: null }),
    );
  });
});
