import { IncomeRange } from '../../../shared/domain/enums/income-range.enum.js';
import { ParentRelation } from '../../../shared/domain/enums/parent-relation.enum.js';

export interface OccupationRef {
  id: string;
  name: string;
}

export interface EducationRef {
  id: string;
  name: string;
}

/** Value unions, not the enums: persistence returns plain strings. */
export interface AdmissionApplicationParentEntity {
  id: string;
  applicationId: string;
  relation: `${ParentRelation}`;
  name: string;
  nik: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  phone: string | null;
  occupationId: string | null;
  educationId: string | null;
  income: `${IncomeRange}` | null;
  isPrimary: boolean;
  occupation?: OccupationRef | null;
  education?: EducationRef | null;
}
