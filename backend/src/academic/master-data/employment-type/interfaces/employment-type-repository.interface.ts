import { EmploymentType } from '@prisma/client';
import {
  CreateEmploymentTypeDto,
  UpdateEmploymentTypeDto,
} from '../dto/create-employment-type.dto.js';
import { EmploymentTypeQueryDto } from '../dto/employment-type-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IEmploymentTypeRepository {
  abstract findAll(
    query: EmploymentTypeQueryDto,
  ): Promise<PaginatedResult<EmploymentType>>;

  abstract findById(id: string): Promise<EmploymentType | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<EmploymentType | null>;

  abstract create(dto: CreateEmploymentTypeDto): Promise<EmploymentType>;

  abstract update(
    id: string,
    dto: UpdateEmploymentTypeDto,
  ): Promise<EmploymentType>;

  abstract remove(id: string): Promise<EmploymentType>;

  abstract countTeachersWithEmploymentType(id: string): Promise<number>;
}
