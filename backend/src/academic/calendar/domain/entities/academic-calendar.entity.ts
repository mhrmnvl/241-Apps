import {
  AcademicYearRef,
  NamedRef,
  SemesterRef,
} from '../../../../shared/domain/entities/index.js';

export interface AcademicCalendarEntity {
  id: string;
  academicYearId: string;
  semesterId?: string | null;
  title: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  description?: string | null;
  deletedAt?: Date | null;
}

export interface CalendarWithDetails extends AcademicCalendarEntity {
  academicYear?: AcademicYearRef;
  semester?: SemesterRef | null;
  type?: NamedRef;
}
