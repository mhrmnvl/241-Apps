import { SchoolUnitType, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export interface SchoolUnitTypeQueryInput {
  page?: number;
  limit?: number;
  search?: string;
}

export abstract class ISchoolUnitTypesRepository {
  abstract findAll(
    query: SchoolUnitTypeQueryInput,
  ): Promise<PaginatedResult<SchoolUnitType>>;

  abstract findById(id: string): Promise<SchoolUnitType | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SchoolUnitType | null>;

  abstract create(
    dto: Prisma.SchoolUnitTypeCreateInput,
  ): Promise<SchoolUnitType>;
  abstract update(
    id: string,
    dto: Prisma.SchoolUnitTypeUpdateInput,
  ): Promise<SchoolUnitType>;

  abstract remove(id: string): Promise<SchoolUnitType>;
  abstract countSchoolUnitsWithType(id: string): Promise<number>;
}
