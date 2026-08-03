import { AdmissionStatus } from '../../../shared/domain/enums/admission-status.enum.js';

/**
 * Row shapes use the enum's *value union* (`` `${Enum}` ``) rather than the enum
 * itself: persistence returns plain strings, and a TS string enum is nominal, so
 * a raw `'DRAFT'` would not be assignable to it.
 */
export interface AdmissionApplicantEntity {
  id: string;
  userId: string;
  registrationNumber: string;
  status: `${AdmissionStatus}`;
  deletedAt?: Date | null;
}
