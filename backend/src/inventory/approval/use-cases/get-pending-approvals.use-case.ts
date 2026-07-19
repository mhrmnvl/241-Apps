import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class GetPendingApprovalsUseCase {
  constructor(
    private readonly repository: IApprovalRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    const roleCodes = userRoles.map((ur) => ur.role.code);

    const instances =
      await this.repository.findPendingInstancesForRoles(roleCodes);

    return Promise.all(
      instances.map(async (inst) => {
        const details =
          inst.workflow.targetEntity === 'InventoryLoan'
            ? await this.prisma.inventoryLoan.findUnique({
                where: { id: inst.referenceId },
                include: {
                  items: {
                    include: {
                      asset: true,
                    },
                  },
                },
              })
            : null;
        return { ...inst, details };
      }),
    );
  }
}
