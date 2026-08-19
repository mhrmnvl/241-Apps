import { BadRequestException } from '@nestjs/common';
import { CreateWorkflowUseCase } from './create-workflow.use-case.js';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

/**
 * Defining who signs a loan.
 *
 * The school configures this itself, and every mistake it can make here is
 * silent at the moment it is made: a workflow numbered 1, 2, 4 accepts loans
 * happily and strands each one at step 3, waiting for an approver that does not
 * exist and telling nobody. So the refusals below happen at definition time,
 * where there is still a person looking at the screen.
 */
describe('CreateWorkflowUseCase', () => {
  function makeUseCase() {
    const createWorkflow = jest.fn().mockResolvedValue({ id: 'wf-1' });
    const repository = { createWorkflow } as unknown as IApprovalRepository;
    return { useCase: new CreateWorkflowUseCase(repository), createWorkflow };
  }

  const BASE = {
    name: 'Persetujuan Peminjaman Aset',
    targetEntity: 'InventoryLoan',
  };

  it('creates the two-step workflow the school runs', async () => {
    const { useCase, createWorkflow } = makeUseCase();

    await useCase.execute({
      ...BASE,
      steps: [
        { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
        { stepSequence: 2, approverRoleCode: 'PRINCIPAL', isMandatory: false },
      ],
    });

    expect(createWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
          {
            stepSequence: 2,
            approverRoleCode: 'PRINCIPAL',
            isMandatory: false,
          },
        ],
      }),
    );
  });

  it('defaults a step to mandatory when the caller says nothing', async () => {
    const { useCase, createWorkflow } = makeUseCase();

    await useCase.execute({
      ...BASE,
      steps: [{ stepSequence: 1, approverRoleCode: 'ADMIN' }],
    });

    expect(createWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
        ],
      }),
    );
  });

  it('accepts steps in any order and stores them in sequence', async () => {
    const { useCase, createWorkflow } = makeUseCase();

    await useCase.execute({
      ...BASE,
      steps: [
        { stepSequence: 2, approverRoleCode: 'PRINCIPAL', isMandatory: false },
        { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: true },
      ],
    });

    const stored = createWorkflow.mock.calls[0][0].steps as {
      approverRoleCode: string;
    }[];
    expect(stored.map((step) => step.approverRoleCode)).toEqual([
      'ADMIN',
      'PRINCIPAL',
    ]);
  });

  it('refuses a workflow with no steps', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({ ...BASE, steps: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  /** 1, 2, 4 strands every loan at step 3. */
  it('refuses a gap in the sequence', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({
        ...BASE,
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN' },
          { stepSequence: 2, approverRoleCode: 'PRINCIPAL' },
          { stepSequence: 4, approverRoleCode: 'TREASURER' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a duplicated sequence number', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({
        ...BASE,
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN' },
          { stepSequence: 1, approverRoleCode: 'PRINCIPAL' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a sequence that does not start at 1', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({
        ...BASE,
        steps: [{ stepSequence: 2, approverRoleCode: 'ADMIN' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  /**
   * Optional means "the previous approver decides". There is no approver before
   * the first step, so the flag would promise a choice nobody is ever offered.
   */
  it('refuses an optional first step', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute({
        ...BASE,
        steps: [
          { stepSequence: 1, approverRoleCode: 'ADMIN', isMandatory: false },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
