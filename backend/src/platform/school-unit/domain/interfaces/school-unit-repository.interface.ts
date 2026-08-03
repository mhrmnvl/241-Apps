import {
  SchoolUnitEntity,
  SchoolUnitWithDetails,
} from '../entities/school-unit.entity.js';

export type { SchoolUnitWithDetails };

/**
 * Every writable column, all optional: the setup flow creates the single school
 * unit incrementally and the adapter defaults whatever is still missing.
 */
export type SchoolUnitRepositoryInput = Partial<
  Omit<SchoolUnitEntity, 'id' | 'deletedAt'>
>;

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
