import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { AcademicCalendarTypeEntity } from '../entities/academic-calendar-type.entity.js';

export interface AcademicCalendarTypeQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export interface CreateAcademicCalendarTypeRepositoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateAcademicCalendarTypeRepositoryInput {
  name?: string;
  isActive?: boolean;
}

export abstract class IAcademicCalendarTypeRepository {
  abstract findAll(
    query: AcademicCalendarTypeQueryInput,
  ): Promise<PaginatedResult<AcademicCalendarTypeEntity>>;

  abstract findById(id: string): Promise<AcademicCalendarTypeEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<AcademicCalendarTypeEntity | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<AcademicCalendarTypeEntity>;
  abstract update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<AcademicCalendarTypeEntity>;

  abstract softDelete(id: string): Promise<AcademicCalendarTypeEntity>;
}
