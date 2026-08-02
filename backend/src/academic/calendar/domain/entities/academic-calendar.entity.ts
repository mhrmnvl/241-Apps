import {
  AcademicYearRef,
  ClassroomRef,
  CodedRef,
  GradeRef,
  NamedRef,
  PersonRef,
  SemesterRef,
  SubjectRef,
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

export interface EventEntity {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface CalendarWithDetails extends AcademicCalendarEntity {
  academicYear?: AcademicYearRef;
  semester?: SemesterRef | null;
  type?: NamedRef;
}

export interface EventWithDetails extends EventEntity {
  audiences?: { audienceGroupId: string; audienceGroup?: NamedRef }[];
}
