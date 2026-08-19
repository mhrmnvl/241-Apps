import { SchoolUnitStatus } from '../../../../shared/domain/enums/school-unit-status.enum.js';
import { SchoolUnitWithDetails } from '../entities/school-unit.entity.js';

export type { SchoolUnitWithDetails };

/**
 * Every writable column, all optional: the setup flow creates the single school
 * unit incrementally and the adapter defaults whatever is still missing.
 *
 * Declared in full rather than derived from `SchoolUnitEntity`. Deriving meant
 * any column added to the entity later became writable through this port
 * without anyone deciding it should — the same silent widening that let
 * `teacherIds` reach the subject repository.
 */
export interface SchoolUnitRepositoryInput {
  typeId?: string | null;
  name?: string;
  surname?: string;
  nsm?: string;
  npsn?: string;
  status?: `${SchoolUnitStatus}`;
  npwp?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export abstract class ISchoolUnitRepository {
  abstract findFirst(): Promise<SchoolUnitWithDetails | null>;
  abstract findById(id: string): Promise<SchoolUnitWithDetails | null>;
  abstract create(
    input: SchoolUnitRepositoryInput,
  ): Promise<SchoolUnitWithDetails>;
  abstract update(
    id: string,
    input: SchoolUnitRepositoryInput,
  ): Promise<SchoolUnitWithDetails>;
}
