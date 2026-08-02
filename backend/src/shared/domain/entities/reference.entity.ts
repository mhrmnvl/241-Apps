import { UserGender } from '../enums/user-gender.enum.js';

/**
 * Minimal read-only projections of rows that are joined into other aggregates.
 *
 * Domain rows describe *what a query returns*, so relations need a shape. These
 * cover the joins that recur across modules — a student or teacher resolved
 * through its user account and profile, or a grade/academic-year/semester
 * label — so each module does not restate them.
 *
 * Enum-typed columns use the value union (`` `${Enum}` ``) because persistence
 * returns plain strings and a TS string enum is nominal.
 */
export interface ProfileRef {
  id: string;
  name: string;
  nik: string;
  gender: `${UserGender}`;
  birthPlace: string;
  birthDate: Date;
  email: string | null;
  phone: string | null;
  avatarFileId: string | null;
}

export interface UserRef {
  id: string;
  identifier: string;
  isActive: boolean;
  profile?: ProfileRef | null;
}

/** A person row reached through its user account, e.g. a student or teacher. */
export interface PersonRef {
  id: string;
  userId: string;
  user?: UserRef;
}

export interface GradeRef {
  id: string;
  level: number;
  name: string;
  isActive: boolean;
  deletedAt: Date | null;
}

export interface AcademicYearRef {
  id: string;
  name: string;
  isActive: boolean;
  deletedAt: Date | null;
}

export interface SemesterRef {
  id: string;
  academicYearId: string;
  typeId: string;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  deletedAt: Date | null;
  academicYear?: AcademicYearRef;
}

export interface ClassroomRef {
  id: string;
  code: string;
  name: string | null;
  gradeId: string;
  academicYearId: string;
  capacity: number;
  grade?: GradeRef;
}

/** Subject codes are optional in the schema, hence the nullable `code`. */
export interface SubjectRef {
  id: string;
  code: string | null;
  name: string;
}

/** Master-data lookup row: an id with a human-readable label. */
export interface NamedRef {
  id: string;
  name: string;
}

/** Master-data lookup row that also carries a stable code. */
export interface CodedRef extends NamedRef {
  code: string;
}
