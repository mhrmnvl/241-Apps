import { AcademicYear, Prisma } from '@prisma/client';
import { AcademicYearQueryDto } from '../../dto/academic-year-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export interface CreateAcademicYearRepositoryInput {
  name: string;
  isActive: boolean;
}

export abstract class IAcademicYearRepository {
  abstract findAll(
    query: AcademicYearQueryDto,
  ): Promise<PaginatedResult<AcademicYear>>;
  abstract findById(id: string): Promise<AcademicYear | null>;
  abstract findByName(name: string): Promise<AcademicYear | null>;
  abstract findLatestAcademicYear(): Promise<AcademicYear | null>;

  abstract create(
    data: CreateAcademicYearRepositoryInput,
  ): Promise<AcademicYear>;

  abstract update(
    id: string,
    data: Prisma.AcademicYearUpdateInput,
  ): Promise<AcademicYear>;
  abstract deactivateAll(): Promise<Prisma.BatchPayload>;
  abstract activateById(id: string): Promise<AcademicYear>;
  abstract hasRelatedData(id: string): Promise<boolean>;
  abstract countActive(): Promise<number>;
  abstract deactivateSemestersByAcademicYearId(
    academicYearId: string,
  ): Promise<Prisma.BatchPayload>;
  abstract softDelete(id: string): Promise<AcademicYear>;
}
