import type {
  PersonRef,
  SemesterRef,
} from '../../../../shared/domain/entities/index.js';
import type { ClassroomEntity } from './classroom.entity.js';

export interface ClassroomSupervisorEntity {
  id: string;
  classroomId: string;
  teacherId: string;
  semesterId: string;
  deletedAt?: Date | null;
}

export interface SupervisorWithDetails extends ClassroomSupervisorEntity {
  classroom?: ClassroomEntity;
  teacher?: PersonRef;
  semester?: SemesterRef;
}
