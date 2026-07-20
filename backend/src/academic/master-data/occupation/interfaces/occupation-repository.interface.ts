import { Occupation, Prisma } from '@prisma/client';
import { CreateOccupationDto } from '../dto/request/create-occupation.dto.js';
import { UpdateOccupationDto } from '../dto/request/update-occupation.dto.js';
import { OccupationQueryDto } from '../dto/request/occupation-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const OCCUPATION_INCLUDE = {
  _count: { select: { parents: true } },
} satisfies Prisma.OccupationInclude;

export type OccupationWithDetails = Prisma.OccupationGetPayload<{
  include: typeof OCCUPATION_INCLUDE;
}>;

export abstract class IOccupationRepository {
  abstract findAll(
    query: OccupationQueryDto,
  ): Promise<PaginatedResult<OccupationWithDetails>>;

  abstract findById(id: string): Promise<OccupationWithDetails | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<Occupation | null>;

  abstract create(dto: CreateOccupationDto): Promise<OccupationWithDetails>;
  abstract update(
    id: string,
    dto: UpdateOccupationDto,
  ): Promise<OccupationWithDetails>;

  abstract remove(id: string): Promise<Occupation>;
  abstract countActiveParents(occupationId: string): Promise<number>;
}
