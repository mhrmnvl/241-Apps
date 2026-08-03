import type {
  NamedRef,
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

export type TeacherListWithDetails = TeacherWithDetails;
