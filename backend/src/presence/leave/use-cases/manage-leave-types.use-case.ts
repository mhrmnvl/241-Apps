import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  LeaveBalanceRow,
  LeaveRequestWithDetails,
  LeaveTypeEntity,
} from '../domain/entities/leave.entity.js';
import {
  ILeaveRepository,
  LeaveRequestQueryInput,
} from '../domain/interfaces/leave-repository.interface.js';
import { CreateLeaveTypeDto } from '../dto/request/create-leave-type.dto.js';
import { UpdateLeaveTypeDto } from '../dto/request/update-leave-type.dto.js';

@Injectable()
export class GetLeaveTypesUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(includeInactive = false): Promise<LeaveTypeEntity[]> {
    return this.leave.findTypes(includeInactive);
  }
}

@Injectable()
export class CreateLeaveTypeUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(dto: CreateLeaveTypeDto): Promise<LeaveTypeEntity> {
    assertQuotaCoherent(dto.consumesQuota, dto.annualQuota);

    return this.leave.createType({
      code: dto.code,
      name: dto.name,
      treatment: dto.treatment,
      consumesQuota: dto.consumesQuota,
      annualQuota: dto.annualQuota ?? null,
      requiresDocument: dto.requiresDocument,
      appliesTo: dto.appliesTo,
    });
  }
}

@Injectable()
export class UpdateLeaveTypeUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(id: string, dto: UpdateLeaveTypeDto): Promise<LeaveTypeEntity> {
    const existing = await this.leave.findTypeById(id);
    if (!existing) {
      throw new NotFoundException('Leave type not found');
    }

    assertQuotaCoherent(
      dto.consumesQuota ?? existing.consumesQuota,
      dto.annualQuota ?? existing.annualQuota,
    );

    return this.leave.updateType(id, dto);
  }
}

@Injectable()
export class DeleteLeaveTypeUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(id: string): Promise<LeaveTypeEntity> {
    if (!(await this.leave.findTypeById(id))) {
      throw new NotFoundException('Leave type not found');
    }

    // Hard-deleting would orphan the requests that used it and break the recap
    // they appear in. Soft delete keeps history readable and stops new use.
    const used = await this.leave.countRequestsOfType(id);
    if (used > 0) {
      throw new ConflictException(
        `${used} request(s) already use this type. Deactivate it instead of deleting.`,
      );
    }

    return this.leave.softDeleteType(id);
  }
}

@Injectable()
export class GetLeaveRequestsUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(
    query: LeaveRequestQueryInput,
  ): Promise<LeaveRequestWithDetails[]> {
    return this.leave.findRequests(query);
  }
}

@Injectable()
export class GetLeaveBalancesUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(userId: string, year: number): Promise<LeaveBalanceRow[]> {
    return this.leave.findBalances(userId, year);
  }
}

/**
 * A type that consumes quota with no quota set would refuse every request as
 * over-limit; a quota on a type that consumes none is a number nobody reads.
 */
function assertQuotaCoherent(
  consumesQuota: boolean,
  annualQuota?: number | null,
): void {
  if (consumesQuota && !annualQuota) {
    throw new UnprocessableEntityException(
      'A type that consumes quota needs an annual quota.',
    );
  }
  if (!consumesQuota && annualQuota) {
    throw new UnprocessableEntityException(
      'An annual quota only makes sense on a type that consumes quota.',
    );
  }
}
