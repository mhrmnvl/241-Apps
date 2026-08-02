import {
  AddressEntity,
  NamedRef,
  UserRef,
} from '../../../../shared/domain/entities/index.js';

export interface TeacherEntity {
  id: string;
  userId: string;
  nip?: string | null;
  nuptk?: string | null;
  employmentTypeId?: string | null;
  joinDate?: Date | null;
  deletedAt?: Date | null;
}

export interface TeacherPositionWithDetails {
  id: string;
  teacherId: string;
  positionId: string;
  isPrimary: boolean;
  hireDate?: Date | null;
  position?: NamedRef | null;
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
