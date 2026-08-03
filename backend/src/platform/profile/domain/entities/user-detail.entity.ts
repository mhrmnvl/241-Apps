import type { AddressEntity } from '../../../../shared/domain/entities/index.js';
import type { NamedRef } from '../../../../shared/domain/entities/index.js';
import type { ProfileWithDetails } from './profile.entity.js';

export interface UserRoleRef {
  userId: string;
  roleId: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
}

export interface TeacherSummaryRef {
  id: string;
  userId: string;
  nip: string | null;
  nuptk: string | null;
  employmentTypeId: string | null;
  addresses?: AddressEntity[];
  employmentType?: NamedRef | null;
}

export interface StudentSummaryRef {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  gradeId: string | null;
}

/** A user account resolved with its profile and role-specific records. */
export interface UserDetail {
  id: string;
  identifier: string;
  userRoles?: UserRoleRef[];
  profile?: ProfileWithDetails | null;
  teacher?: TeacherSummaryRef | null;
  student?: StudentSummaryRef | null;
}
