import { Religion, Prisma } from '@prisma/client';
import { ReligionQueryDto } from '../../dto/religion-query.dto.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IReligionRepository {
  abstract findAll(query: ReligionQueryDto): Promise<PaginatedResult<Religion>>;

  abstract findById(id: string): Promise<Religion | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<Religion | null>;
  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<Religion>;
  abstract update(
    id: string,
    data: Prisma.ReligionUpdateInput,
  ): Promise<Religion>;
  abstract softDelete(id: string): Promise<Religion>;
}
