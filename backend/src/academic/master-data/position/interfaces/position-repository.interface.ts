import { Position, Prisma } from '@prisma/client';
import { CreatePositionDto } from '../dto/create-position.dto.js';
import { UpdatePositionDto } from '../dto/update-position.dto.js';
import { PositionQueryDto } from '../dto/position-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const POSITION_INCLUDE = {
  category: true,
  _count: { select: { teacherPositions: true } },
} satisfies Prisma.PositionInclude;

export type PositionWithDetails = Prisma.PositionGetPayload<{
  include: typeof POSITION_INCLUDE;
}>;

export abstract class IPositionRepository {
  abstract findAll(
    query: PositionQueryDto,
  ): Promise<PaginatedResult<PositionWithDetails>>;

  abstract findById(id: string): Promise<PositionWithDetails | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<Position | null>;

  abstract create(dto: CreatePositionDto): Promise<Position>;
  abstract update(id: string, dto: UpdatePositionDto): Promise<Position>;
  abstract remove(id: string): Promise<Position>;
  abstract countActiveAssignments(positionId: string): Promise<number>;
}
