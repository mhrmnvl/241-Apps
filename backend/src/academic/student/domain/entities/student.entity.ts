import { StudentStatusEnum } from '../../../../shared/domain/enums/student-status.enum.js';

export interface StudentEntity {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  status: `${StudentStatusEnum}`;
  gradeId?: string | null;
  deletedAt?: Date | null;
}

export interface StudentWithDetails extends StudentEntity {
  user: {
    id: string;
    identifier: string;
    isActive: boolean;
    profile?: {
      name?: string | null;
      nik?: string | null;
      gender?: string | null;
      birthPlace?: string | null;
      birthDate?: Date | string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  };
  grade?: {
    id: string;
    name: string;
    level: number;
  } | null;
  enrollments?: {
    classroom: {
      code: string;
    };
  }[];
  parents?: { parentId: string; isPrimary: boolean; relation: string }[];
}
