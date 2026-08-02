import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

@Injectable()
export class GetPendingApprovalsUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute(userId: string) {
    const roleCodes = await this.approvalRepository.findUserRoleCodes(userId);

    const instances =
      await this.approvalRepository.findPendingInstancesForRoles(roleCodes);

    return Promise.all(
      instances.map(async (inst) => {
        const details =
          inst.workflow?.targetEntity === 'InventoryLoan' && inst.referenceId
            ? await this.approvalRepository.findLoanDetailsForInstance(
                inst.referenceId,
              )
            : null;
        return { ...inst, details };
      }),
    );
  }
}
