import {
  ConflictException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import {
  ApproveLeaveRequestUseCase,
  RejectLeaveRequestUseCase,
  WithdrawLeaveRequestUseCase,
} from './decide-leave-request.use-case.js';

const REQUESTER = '11111111-1111-4111-8111-111111111111';
const APPROVER = '22222222-2222-4222-8222-222222222222';

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: 'req-1',
    requesterId: REQUESTER,
    leaveTypeId: 'type-1',
    status: 'PENDING',
    workingDayCount: 2,
    startDate: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  };
}

const CUTI = {
  id: 'type-1',
  name: 'Cuti Tahunan',
  treatment: 'ON_LEAVE',
  consumesQuota: true,
  annualQuota: 12,
};

describe('leave decisions', () => {
  let approve: ApproveLeaveRequestUseCase;
  let reject: RejectLeaveRequestUseCase;
  let withdraw: WithdrawLeaveRequestUseCase;
  const leave = {
    findRequestById: jest.fn(),
    findTypeById: jest.fn(),
    countUsedDays: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    withdraw: jest.fn(),
  };
  const credentials = { findActiveByUserId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveLeaveRequestUseCase,
        RejectLeaveRequestUseCase,
        WithdrawLeaveRequestUseCase,
        { provide: ILeaveRepository, useValue: leave },
        { provide: ICredentialRepository, useValue: credentials },
      ],
    }).compile();

    approve = module.get(ApproveLeaveRequestUseCase);
    reject = module.get(RejectLeaveRequestUseCase);
    withdraw = module.get(WithdrawLeaveRequestUseCase);
    jest.clearAllMocks();
    leave.findRequestById.mockResolvedValue(request());
    leave.findTypeById.mockResolvedValue(CUTI);
    leave.countUsedDays.mockResolvedValue(0);
    leave.approve.mockResolvedValue(request({ status: 'APPROVED' }));
    leave.reject.mockResolvedValue(request({ status: 'REJECTED' }));
    leave.withdraw.mockResolvedValue(request({ status: 'WITHDRAWN' }));
    credentials.findActiveByUserId.mockResolvedValue({
      subjectType: 'EMPLOYEE',
    });
  });

  describe('approving', () => {
    it('approves and passes the treatment through to the presence rows', async () => {
      await approve.execute('req-1', APPROVER);

      expect(leave.approve).toHaveBeenCalledWith(
        'req-1',
        { approverId: APPROVER, decidedAt: expect.any(Date) },
        'ON_LEAVE',
        'EMPLOYEE',
      );
    });

    // DINAS_LUAR is working elsewhere, not leave — it must not read as leave in
    // a recap or cost an attendance-driven allowance.
    it('carries OFFICIAL_DUTY through rather than flattening it to leave', async () => {
      leave.findTypeById.mockResolvedValue({
        ...CUTI,
        treatment: 'OFFICIAL_DUTY',
        consumesQuota: false,
        annualQuota: null,
      });

      await approve.execute('req-1', APPROVER);

      expect(leave.approve).toHaveBeenCalledWith(
        'req-1',
        expect.anything(),
        'OFFICIAL_DUTY',
        'EMPLOYEE',
      );
    });

    // FR-029. Including the Kepala Sekolah, whose own leave needs somebody else.
    it('refuses an approver deciding their own request', async () => {
      leave.findRequestById.mockResolvedValue(
        request({ requesterId: APPROVER }),
      );

      await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
        ForbiddenException,
      );
      expect(leave.approve).not.toHaveBeenCalled();
    });

    it('refuses a request that is not pending', async () => {
      leave.findRequestById.mockResolvedValue(request({ status: 'APPROVED' }));

      await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
        ConflictException,
      );
    });

    describe('quota', () => {
      it('allows a request inside the remaining quota', async () => {
        leave.countUsedDays.mockResolvedValue(10);

        await expect(approve.execute('req-1', APPROVER)).resolves.toBeDefined();
      });

      // FR-032: the shortfall is stated, not just the refusal — otherwise the
      // approver has to work out the arithmetic themselves.
      it('refuses over quota and names the shortfall', async () => {
        leave.countUsedDays.mockResolvedValue(11);

        await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
          /Short by 1/,
        );
      });

      it('reports the remaining days and the total', async () => {
        leave.countUsedDays.mockResolvedValue(11);

        await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
          /1 day\(s\) remaining of 12/,
        );
      });

      it('skips the quota check entirely for a type that consumes none', async () => {
        leave.findTypeById.mockResolvedValue({
          ...CUTI,
          consumesQuota: false,
          annualQuota: null,
        });

        await approve.execute('req-1', APPROVER);

        expect(leave.countUsedDays).not.toHaveBeenCalled();
      });

      // Quota is annual, so it must be counted against the year the leave
      // falls in rather than the year it was approved.
      it('counts usage against the year the leave starts in', async () => {
        await approve.execute('req-1', APPROVER);

        expect(leave.countUsedDays).toHaveBeenCalledWith(
          REQUESTER,
          'type-1',
          2026,
        );
      });
    });

    it('falls back to EMPLOYEE when the requester holds no card', async () => {
      credentials.findActiveByUserId.mockResolvedValue(null);

      await approve.execute('req-1', APPROVER);

      expect(leave.approve).toHaveBeenCalledWith(
        'req-1',
        expect.anything(),
        'ON_LEAVE',
        'EMPLOYEE',
      );
    });
  });

  describe('rejecting', () => {
    it('records the reason so the requester is told why (FR-031)', async () => {
      await reject.execute('req-1', { reason: 'Bentrok ujian' }, APPROVER);

      expect(leave.reject).toHaveBeenCalledWith('req-1', {
        approverId: APPROVER,
        decidedAt: expect.any(Date),
        decisionReason: 'Bentrok ujian',
      });
    });

    it('refuses an approver deciding their own request', async () => {
      leave.findRequestById.mockResolvedValue(
        request({ requesterId: APPROVER }),
      );

      await expect(
        reject.execute('req-1', { reason: 'x' }, APPROVER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('withdrawing', () => {
    it('lets the requester withdraw their own pending request', async () => {
      await withdraw.execute('req-1', REQUESTER);

      expect(leave.withdraw).toHaveBeenCalledWith('req-1');
    });

    it('refuses withdrawing somebody else request', async () => {
      await expect(withdraw.execute('req-1', APPROVER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    // A decided request has already moved presence rows; unwinding it is an
    // approver's job, not a silent self-service action.
    it('refuses withdrawing an already-decided request', async () => {
      leave.findRequestById.mockResolvedValue(request({ status: 'APPROVED' }));

      await expect(withdraw.execute('req-1', REQUESTER)).rejects.toThrow(
        ConflictException,
      );
    });

    it('consumes no quota, because nothing was approved', async () => {
      await withdraw.execute('req-1', REQUESTER);

      expect(leave.countUsedDays).not.toHaveBeenCalled();
    });
  });

  it('surfaces a missing leave type rather than approving blindly', async () => {
    leave.findTypeById.mockResolvedValue(null);

    await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
      /Leave type/,
    );
  });

  it('refuses a request that no longer exists', async () => {
    leave.findRequestById.mockResolvedValue(null);

    await expect(approve.execute('missing', APPROVER)).rejects.toThrow(
      /not found/,
    );
  });

  it('never lets an over-quota request reach the repository', async () => {
    leave.countUsedDays.mockResolvedValue(12);

    await expect(approve.execute('req-1', APPROVER)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(leave.approve).not.toHaveBeenCalled();
  });
});
