import { SchoolUnitStatus } from '../../../../shared/domain/enums/school-unit-status.enum.js';
import {
  AcademicYearRef,
  AddressEntity,
  ClassroomRef,
  CodedRef,
  GradeRef,
  NamedRef,
  PersonRef,
  SemesterRef,
  SubjectRef,
} from '../../../../shared/domain/entities/index.js';
export interface SchoolUnitEntity {
  id: string;
  typeId?: string | null;
  name: string;
  surname?: string;
  nsm?: string;
  npsn?: string;
  status?: `${SchoolUnitStatus}`;
  npwp?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export type SchoolUnitInputDto = Partial<
  Omit<SchoolUnitEntity, 'id' | 'deletedAt'>
>;

export interface SchoolUnitWithDetails extends SchoolUnitEntity {
  type?: NamedRef | null;
  addresses?: AddressEntity[];
  socialMedias?: {
    id: string;
    socialMediaId: string;
    username: string | null;
    socialMedia?: NamedRef;
  }[];
}
