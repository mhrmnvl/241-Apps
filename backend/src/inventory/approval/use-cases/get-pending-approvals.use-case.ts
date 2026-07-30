import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

@Injectable()
export class GetPendingApprovalsUseCase {
  constructor(private readonly repository: IApprovalRepository) {}

  async execute(userId: string) {
    const roleCodes = await this.repository.findUserRoleCodes(userId);

    const instances =
      await this.repository.findPendingInstancesForRoles(roleCodes);

    return Promise.all(
      instances.map(async (inst) => {
        const details =
          inst.workflow.targetEntity === 'InventoryLoan'
            ? await this.repository.findLoanDetailsForInstance(inst.referenceId)
            : null;
        return { ...inst, details };
      }),
    );
  }
}
