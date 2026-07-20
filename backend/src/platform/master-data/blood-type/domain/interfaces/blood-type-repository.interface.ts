import { BloodType, Prisma } from '@prisma/client';
import { BloodTypeQueryDto } from '../../dto/request/blood-type-query.dto.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IBloodTypeRepository {
  abstract findAll(
    query: BloodTypeQueryDto,
  ): Promise<PaginatedResult<BloodType>>;

  abstract findById(id: string): Promise<BloodType | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<BloodType | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<BloodType>;
  abstract update(
    id: string,
    data: Prisma.BloodTypeUpdateInput,
  ): Promise<BloodType>;

  abstract softDelete(id: string): Promise<BloodType>;
}
