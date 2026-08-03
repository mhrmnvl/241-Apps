import type { NamedRef } from '../../../../shared/domain/entities/index.js';

export interface TeacherPositionEntity {
  id: string;
  teacherId: string;
  positionId: string;
  hireDate: Date;
  isPrimary: boolean;
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
