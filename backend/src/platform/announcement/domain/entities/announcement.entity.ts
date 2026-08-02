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
export interface AnnouncementEntity {
  id: string;
  title: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface AnnouncementWithDetails extends AnnouncementEntity {
  author?: { id: string; identifier: string };
  targetRoles?: CodedRef[];
  classrooms?: { classroomId: string; classroom?: ClassroomRef }[];
}
