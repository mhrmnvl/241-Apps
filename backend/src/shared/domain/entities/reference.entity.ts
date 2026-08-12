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
/**
 * The three profile projections, mirroring the three query shapes in
 * `shared/domain/prisma-selects.ts`. A row can only describe what was actually
 * selected, so a query narrowed to a name must be typed as a name.
 */

/** A person as a label — what most joins need. */
export interface ProfileNameRef {
  name: string;
}

/** A person shown with their picture. The URL is derived from the storage key. */
export interface ProfileDisplayRef extends ProfileNameRef {
  avatarFile?: { storageKey: string } | null;
}

/** A person on a roster whose list shows gender, and for teachers the NIK. */
export interface ProfileRosterRef extends ProfileNameRef {
  nik: string;
  gender: `${UserGender}`;
}

/**
 * Defaulted to the name projection because that is what nearly every join
 * selects. A roster or display join states its shape:
 * `PersonRef<ProfileRosterRef>`.
 */
export interface UserRef<TProfile = ProfileNameRef> {
  id: string;
  identifier: string;
  isActive: boolean;
  profile?: TProfile | null;
}

/** A person row reached through its user account, e.g. a student or teacher. */
export interface PersonRef<TProfile = ProfileNameRef> {
  id: string;
  userId: string;
  user?: UserRef<TProfile>;
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
