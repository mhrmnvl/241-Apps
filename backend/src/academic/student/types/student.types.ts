import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';
export interface StudentProfile {
  name: string | null;
  nik: string | null;
  gender: UserGender | null;
  birthPlace: string | null;
  birthDate: Date | null;
  email: string | null;
  phone: string | null;
}
export interface StudentUser {
  identifier: string;
  isActive: boolean;
  profile: StudentProfile | null;
}
export interface StudentClassroom {
  id: string;
  code: string;
  name: string;
  gradeId: string;
}
export interface RequestUser {
  id: string;
}
