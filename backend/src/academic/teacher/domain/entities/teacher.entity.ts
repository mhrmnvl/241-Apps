import type {
  NamedRef,
  ProfileRosterRef,
  UserRef,
} from '../../../../shared/domain/entities/index.js';
import type { AddressEntity } from '../../../../shared/domain/entities/index.js';
import type { TeacherPositionWithDetails } from './teacher-position.entity.js';

export interface TeacherEntity {
  id: string;
  userId: string;
  nip?: string | null;
  nuptk?: string | null;
  employmentTypeId?: string | null;
  joinDate?: Date | null;
  deletedAt?: Date | null;
}

export interface TeacherAssignmentRef {
  id: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

export interface TeacherWithDetails extends TeacherEntity {
  user: UserRef;
  employmentType?: NamedRef | null;
  addresses?: AddressEntity[];
  teacherPositions?: TeacherPositionWithDetails[];
  teachingAssignments?: TeacherAssignmentRef[];
}

/** The list shows a name, a gender and a NIK — see PROFILE_ROSTER_SELECT. */
export type TeacherListWithDetails = Omit<TeacherWithDetails, 'user'> & {
  user: UserRef<ProfileRosterRef>;
};

/**
 * The spreadsheet export has a column per personal field, so it reads them.
 * Declared here rather than widening a shared shape, because it is the only
 * caller that needs this width.
 */
export interface TeacherExportProfileRef extends ProfileRosterRef {
  birthPlace: string;
  birthDate: Date;
  email: string | null;
  phone: string | null;
}

export type TeacherExportWithDetails = Omit<TeacherWithDetails, 'user'> & {
  user: UserRef<TeacherExportProfileRef>;
};
