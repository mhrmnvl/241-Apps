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
  /**
   * Classrooms the entry is for. Absent or empty means the whole school.
   *
   * On update the list is replaced wholesale, never merged: dropping a class
   * from an entry has to be expressible, and a merge makes removal impossible
   * without a second call nobody would think to make.
   */
  classroomIds?: string[];
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
