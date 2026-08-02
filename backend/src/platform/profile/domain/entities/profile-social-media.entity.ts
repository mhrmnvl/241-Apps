import {
  AcademicYearRef,
  ClassroomRef,
  CodedRef,
  GradeRef,
  NamedRef,
  PersonRef,
  SemesterRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';
export interface ProfileSocialMediaEntity {
  id: string;
  socialMediaId: string;
  profileId: string;
  username?: string | null;
  deletedAt?: Date | null;
}

export interface AddressPublic {
  id: string;
  street: string;
  rt?: string | null;
  rw?: string | null;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ProfileSocialMediaWithDetails extends ProfileSocialMediaEntity {
  socialMedia?: NamedRef;
  profile?: { id: string; userId: string; name: string };
}
