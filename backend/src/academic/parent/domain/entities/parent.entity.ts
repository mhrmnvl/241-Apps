import {
  AddressEntity,
  NamedRef,
  UserRef,
} from '../../../../shared/domain/entities/index.js';

export interface ParentEntity {
  id: string;
  userId?: string;
  nik?: string | null;
  name?: string;
  occupationId?: string | null;
  educationId?: string | null;
  deletedAt?: Date | null;
}

export interface ParentWithDetails extends ParentEntity {
  user?: UserRef | null;
  occupation?: NamedRef | null;
  education?: NamedRef | null;
  addresses?: AddressEntity[];
  students?: { studentId: string; isPrimary: boolean }[];
}

export type ParentListWithDetails = ParentWithDetails;
