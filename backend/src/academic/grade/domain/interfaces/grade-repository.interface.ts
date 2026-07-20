import { Grade } from '@prisma/client';
import type { GradeQueryDto } from '../../dto/request/grade-query.dto.js';
import type { CreateGradeDto } from '../../dto/request/create-grade.dto.js';
import type { UpdateGradeDto } from '../../dto/request/update-grade.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IGradeRepository {
  abstract findAll(query: GradeQueryDto): Promise<PaginatedResult<Grade>>;

  abstract findById(id: string): Promise<Grade | null>;
  abstract findByLevel(level: number): Promise<Grade | null>;
  abstract findByName(name: string): Promise<Grade | null>;
  abstract create(dto: CreateGradeDto): Promise<Grade>;
  abstract update(id: string, dto: UpdateGradeDto): Promise<Grade>;
  abstract softDelete(id: string): Promise<Grade>;
}
