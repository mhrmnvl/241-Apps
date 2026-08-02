import type { ApplicationWithParentsAndUser } from './interfaces/admission-application-repository.interface.js';

/**
 * The parent fields the real `Parent` table requires. Declared here rather than
 * `Pick`ed off a Prisma model so this business rule owns its own contract.
 */
interface ParentCompletenessFields {
  nik: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  occupationId: string | null;
}

/**
 * An admission parent can only be carried over into a real Parent record
 * once it has everything that table requires. Incomplete ones are skipped
 * (not blocking) during enrollment.
 */
export function isEligibleAdmissionParent<T extends ParentCompletenessFields>(
  parent: T,
): parent is T & {
  nik: string;
  birthPlace: string;
  birthDate: Date;
  occupationId: string;
} {
  return Boolean(
    parent.nik && parent.birthPlace && parent.birthDate && parent.occupationId,
  );
}

type AddressCompletenessFields = Pick<
  ApplicationWithParentsAndUser,
  'street' | 'rt' | 'rw' | 'village' | 'district' | 'city' | 'province'
>;

/**
 * The applicant's domicile section is only carried over as the student's
 * primary Address once every required field (all but postalCode) is present.
 */
export function hasCompleteAddress<T extends AddressCompletenessFields>(
  application: T,
): application is T & {
  street: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
} {
  return Boolean(
    application.street &&
    application.rt &&
    application.rw &&
    application.village &&
    application.district &&
    application.city &&
    application.province,
  );
}
