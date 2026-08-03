import type {
  PersonRef,
  SemesterRef,
} from '../../../../shared/domain/entities/index.js';
import type { ClassroomEntity } from './classroom.entity.js';

export interface ClassroomStructureEntity {
  id: string;
  classroomId: string;
  semesterId: string;
  presidentId?: string | null;
  vicePresidentId?: string | null;
  secretaryId?: string | null;
  treasurerId?: string | null;
  deletedAt?: Date | null;
}

export interface StructureWithDetails extends ClassroomStructureEntity {
  classroom?: ClassroomEntity;
  semester?: SemesterRef;
  president?: PersonRef | null;
  vicePresident?: PersonRef | null;
  secretary?: PersonRef | null;
  treasurer?: PersonRef | null;
}
