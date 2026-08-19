import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProcessApprovalUseCase } from './process-approval.use-case.js';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

/**
 * Who signs a loan, and how many of them.
 *
 * Two things are asserted here that the code got wrong before. The first is
 * authorization: this use case used to accept `SUPER_ADMIN` regardless of the
 * workflow, a bypass copied out of PermissionGuard — a second copy of a rule
 * drifts from the first, and the constitution forbids it for that reason.
 *
 * The second is the school's actual question. A projector borrowed for a class
 * does not need the head teacher's signature; the minibus does. So the second
 * step is optional, and the inventory administrator decides per loan whether it
 * is taken. `isMandatory` existed in the schema the whole time and nothing read
 * it, which meant every workflow behaved as though every step were required.
 */
describe('ProcessApprovalUseCase', () => {
  const PENDING_STATUS = { id: 'st-pending' };

  interface StepShape {
    stepSequence: number;
    approverRoleCode: string;
    isMandatory: boolean;
  }

  function makeRepository(options: {
    steps: StepShape[];
    currentStepSequence?: number;
    roleCodes: string[];
  }) {
    const processApprovalTransaction = jest.fn().mockResolvedValue({
      success: true,
      action: 'APPROVE_FINAL',
      log: {},
    });

    const repository = {
      findInstanceById: jest.fn().mockResolvedValue({
        id: 'inst-1',
        referenceId: 'loan-1',
        statusId: PENDING_STATUS.id,
        currentStepSequence: options.currentStepSequence ?? 1,
        workflow: { steps: options.steps },
      }),
      findStatusBySystemKey: jest.fn().mockResolvedValue(PENDING_STATUS),
      findUserRoleCodes: jest.fn().mockResolvedValue(options.roleCodes),
      processApprovalTransaction,
    } as unknown as IApprovalRepository;

    return {
      useCase: new ProcessApprovalUseCase(repository),
      processApprovalTransaction,
    };
  }

  const TWO_STEP_OPTIONAL: StepShape[] = [
    { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
    { stepSequence: 2, approverRoleCode: 'PRINCIPAL', isMandatory: false },
  ];

  const TWO_STEP_MANDATORY: StepShape[] = [
    { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
    { stepSequence: 2, approverRoleCode: 'PRINCIPAL', isMandatory: true },
  ];

  describe('authorization', () => {
    it('accepts the role the workflow names as this step’s approver', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        roleCodes: ['ADMIN'],
      });

      await useCase.execute('inst-1', { action: 'APPROVE' }, 'user-1');

      expect(processApprovalTransaction).toHaveBeenCalled();
    });

    it('refuses a role the workflow does not name', async () => {
      const { useCase } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        roleCodes: ['TEACHER'],
      });

      await expect(
        useCase.execute('inst-1', { action: 'APPROVE' }, 'user-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    /**
     * The removed bypass. A super admin who genuinely needs to approve is named
     * as the step's approver like anybody else — this is not a hole reopened by
     * convenience.
     */
    it('refuses SUPER_ADMIN when the workflow does not name it', async () => {
      const { useCase } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        roleCodes: ['SUPER_ADMIN'],
      });

      await expect(
        useCase.execute('inst-1', { action: 'APPROVE' }, 'user-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('the optional second approver', () => {
    it('finishes the loan when the administrator does not forward it', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        roleCodes: ['ADMIN'],
      });

      await useCase.execute('inst-1', { action: 'APPROVE' }, 'user-1');

      expect(processApprovalTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ hasNextStep: false }),
      );
    });

    it('passes it to the head teacher when the administrator asks', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        roleCodes: ['ADMIN'],
      });

      await useCase.execute(
        'inst-1',
        { action: 'APPROVE', forwardToNextApprover: true },
        'user-1',
      );

      expect(processApprovalTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ hasNextStep: true, nextStepSequence: 2 }),
      );
    });

    /**
     * The choice is a choice only where the workflow left one. An approver
     * cannot waive a signature the school decided the loan needs.
     */
    it('takes a mandatory next step even when not asked to forward', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_MANDATORY,
        roleCodes: ['ADMIN'],
      });

      await useCase.execute(
        'inst-1',
        { action: 'APPROVE', forwardToNextApprover: false },
        'user-1',
      );

      expect(processApprovalTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ hasNextStep: true, nextStepSequence: 2 }),
      );
    });

    /**
     * Silently ignoring this would leave the requester waiting on an approver
     * who does not exist.
     */
    it('refuses to forward when there is no further step', async () => {
      const { useCase } = makeRepository({
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
        ],
        roleCodes: ['ADMIN'],
      });

      await expect(
        useCase.execute(
          'inst-1',
          { action: 'APPROVE', forwardToNextApprover: true },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('never forwards a rejection', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_MANDATORY,
        roleCodes: ['ADMIN'],
      });

      await useCase.execute(
        'inst-1',
        { action: 'REJECT', note: 'Aset sedang diperbaiki' },
        'user-1',
      );

      expect(processApprovalTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ hasNextStep: false }),
      );
    });

    it('is already final at the last step', async () => {
      const { useCase, processApprovalTransaction } = makeRepository({
        steps: TWO_STEP_OPTIONAL,
        currentStepSequence: 2,
        roleCodes: ['PRINCIPAL'],
      });

      await useCase.execute('inst-1', { action: 'APPROVE' }, 'user-1');

      expect(processApprovalTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          hasNextStep: false,
          nextStepSequence: undefined,
        }),
      );
    });
  });
});
