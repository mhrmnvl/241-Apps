import { BadRequestException, Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { CreateWorkflowDto } from '../dto/request/create-workflow.dto.js';

@Injectable()
export class CreateWorkflowUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute(dto: CreateWorkflowDto) {
    const steps = [...dto.steps].sort(
      (a, b) => a.stepSequence - b.stepSequence,
    );

    if (steps.length === 0) {
      throw new BadRequestException(
        'A workflow needs at least one approval step.',
      );
    }

    // The sequence is how a loan travels: an instance starts at 1 and moves to
    // the number after the one just signed. A gap or a duplicate is not a
    // cosmetic problem — the loan reaches a number no step answers to and stops
    // there, pending forever, with nobody told it is waiting for them.
    const expected = steps.map((_, index) => index + 1);
    const actual = steps.map((step) => step.stepSequence);
    if (actual.join(',') !== expected.join(',')) {
      throw new BadRequestException(
        `Approval steps must be numbered 1 to ${steps.length} with no gaps or duplicates.`,
      );
    }

    // Optional means "the previous approver decides". The first step has no
    // previous approver, so nobody would ever be asked, and the flag would read
    // as a choice the screen never offers.
    if (steps[0].isMandatory === false) {
      throw new BadRequestException(
        'The first approval step cannot be optional — there is no earlier approver to decide whether to skip it.',
      );
    }

    return this.approvalRepository.createWorkflow({
      name: dto.name,
      targetEntity: dto.targetEntity,
      description: dto.description ?? null,
      isActive: true,
      steps: steps.map((step) => ({
        stepSequence: step.stepSequence,
        approverRoleCode: step.approverRoleCode,
        isMandatory: step.isMandatory ?? true,
      })),
    });
  }
}
