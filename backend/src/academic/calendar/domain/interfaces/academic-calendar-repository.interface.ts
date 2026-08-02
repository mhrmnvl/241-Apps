import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { AcademicCalendarEntity } from '../entities/academic-calendar.entity.js';
import { CalendarWithDetails } from '../entities/academic-calendar.entity.js';

export type { CalendarWithDetails };

export interface AcademicCalendarQueryInput extends PaginationQueryInput {
  academicYearId?: string;
  semesterId?: string;
  typeId?: string;
}

export interface CreateAcademicCalendarRepositoryInput {
  academicYearId: string;
  /** Omitted for cross-semester entries. */
  semesterId?: string | null;
  title: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  description?: string | null;
}

export type UpdateAcademicCalendarRepositoryInput =
  Partial<CreateAcademicCalendarRepositoryInput>;

export abstract class IAcademicCalendarRepository {
  abstract findAll(
    query: AcademicCalendarQueryInput,
  ): Promise<PaginatedResult<CalendarWithDetails>>;
  abstract findById(id: string): Promise<CalendarWithDetails | null>;
  abstract create(
    input: CreateAcademicCalendarRepositoryInput,
  ): Promise<CalendarWithDetails>;
  abstract update(
    id: string,
    input: UpdateAcademicCalendarRepositoryInput,
  ): Promise<CalendarWithDetails>;
  abstract remove(id: string): Promise<AcademicCalendarEntity>;
  abstract softDelete(id: string): Promise<AcademicCalendarEntity>;
}
