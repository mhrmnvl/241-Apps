import { UserGender } from '../../../../shared/domain/enums/user-gender.enum.js';
import { MaritalStatus } from '../../../../shared/domain/enums/marital-status.enum.js';
import {
  AddressEntity,
  NamedRef,
} from '../../../../shared/domain/entities/index.js';

export interface ProfileEntity {
  id: string;
  userId: string;
  name: string;
  nik: string;
  /** Value union, not the enum: persistence hands back a plain string. */
  gender: `${UserGender}`;
  birthPlace: string;
  birthDate: Date;
  email?: string | null;
  phone?: string | null;
  religionId?: string | null;
  bloodTypeId?: string | null;
  maritalStatus?: `${MaritalStatus}` | null;
  noKk?: string | null;
  npwp?: string | null;
  avatarFileId?: string | null;
}

export type ProfileUpdateInput = Partial<Omit<ProfileEntity, 'id' | 'userId'>>;

export interface ProfileFileRef {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export interface AchievementRef {
  id: string;
  profileId: string;
  name: string;
  level: string;
  typeId: string;
  year: number;
  description: string | null;
  type?: NamedRef;
}

export interface ScholarshipRef {
  id: string;
  profileId: string;
  name: string;
  provider: string;
  year: number;
  status: string;
}

export interface EducationalHistoryRef {
  id: string;
  profileId: string;
  level: string;
  institution: string;
  major: string | null;
  startYear: number;
  endYear: number | null;
  status: string;
}

export interface ProfileWithDetails extends ProfileEntity {
  socialMedias?: SocialMediaItem[];
  achievements?: AchievementRef[];
  scholarships?: ScholarshipRef[];
  educationalHistories?: EducationalHistoryRef[];
  religion?: NamedRef | null;
  bloodType?: NamedRef | null;
  avatarFile?: ProfileFileRef | null;
}

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

export interface UserDetail {
  id: string;
  identifier: string;
  userRoles?: UserRoleRef[];
  profile?: ProfileWithDetails | null;
  teacher?: TeacherSummaryRef | null;
  student?: StudentSummaryRef | null;
}

export interface SocialMediaItem {
  id: string;
  socialMediaId: string;
  username?: string | null;
  socialMedia: {
    name: string;
    baseUrl?: string | null;
  };
}

export interface ProfileWithSocialMedias extends ProfileEntity {
  user: {
    userRoles: {
      role: {
        code: string;
      };
    }[];
  };
  socialMedias: SocialMediaItem[];
}
