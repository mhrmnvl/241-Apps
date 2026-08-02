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
import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';

export interface TimeSlotTypeEntity {
  id: string;
  code: string;
  name: string;
  isLesson: boolean;
  days: DayEnum[] | string[];
  deletedAt?: Date | null;
}

export interface TimeSlotEntity {
  id: string;
  typeId: string;
  name: string;
  startTime: Date | string;
  endTime: Date | string;
  order: number;
  deletedAt?: Date | null;
}

export interface TimeSlotWithType extends TimeSlotEntity {
  type?: TimeSlotTypeEntity;
}

export interface TimeSlotWithDetails extends TimeSlotEntity {
  type?: TimeSlotTypeEntity;
  schedules?: { id: string; teachingAssignmentId: string }[];
}
