import { Grade } from '@prisma/client';
import type { ClassroomLevelQueryDto } from '../../dto/grade-query.dto.js';
import type { CreateGradeDto } from '../../dto/create-grade.dto.js';
import type { UpdateGradeDto } from '../../dto/update-grade.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IClassroomLevelsRepository {
  abstract findAll(
    query: ClassroomLevelQueryDto,
  ): Promise<PaginatedResult<Grade>>;

  abstract findById(id: string): Promise<Grade | null>;
  abstract findByLevel(level: number): Promise<Grade | null>;
  abstract findByName(name: string): Promise<Grade | null>;
  abstract create(dto: CreateGradeDto): Promise<Grade>;
  abstract update(id: string, dto: UpdateGradeDto): Promise<Grade>;
  abstract softDelete(id: string): Promise<Grade>;
}
