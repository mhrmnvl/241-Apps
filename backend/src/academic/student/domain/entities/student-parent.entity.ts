import { ParentRelation } from '../../../../shared/domain/enums/parent-relation.enum.js';
import {
  NamedRef,
  PersonRef,
} from '../../../../shared/domain/entities/index.js';

export interface StudentParentEntity {
  id: string;
  studentId: string;
  parentId: string;
  /** Value union, not the enum: persistence hands back a plain string. */
  relation: `${ParentRelation}`;
  isPrimary: boolean;
  deletedAt?: Date | null;
}

/** Parent row as joined onto a student link, with its master-data labels. */
export interface LinkedParentRef {
  id: string;
  name: string;
  nik: string;
  birthPlace: string;
  birthDate: Date;
  email: string | null;
  phone: string | null;
  occupationId: string;
  educationId: string | null;
  occupation?: NamedRef | null;
  education?: NamedRef | null;
}

export interface StudentParentWithDetails extends StudentParentEntity {
  parent?: LinkedParentRef;
  student?: PersonRef;
}
