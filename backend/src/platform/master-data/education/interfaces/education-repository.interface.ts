import { Education, Prisma } from '@prisma/client';
import { EducationQueryDto } from '../dto/request/education-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IEducationRepository {
  abstract findAll(
    query: EducationQueryDto,
  ): Promise<PaginatedResult<Education>>;

  abstract findById(id: string): Promise<Education | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<Education | null>;

  abstract countParentUsage(id: string): Promise<number>;
  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<Education>;
  abstract update(
    id: string,
    data: Prisma.EducationUpdateInput,
  ): Promise<Education>;

  abstract softDelete(id: string): Promise<Education>;
}
