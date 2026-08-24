import { AcademicSettingEntity } from '../entities/academic-setting.entity.js';

/**
 * Every writable column, listed rather than derived from the entity.
 *
 * Deriving it means any column added later becomes writable through this port
 * without anyone deciding it should — the same silent widening the school-unit
 * port was written to avoid.
 */
export interface AcademicSettingRepositoryInput {
  weeklyHolidays?: number[];
  defaultPassingScore?: number;
}

export abstract class IAcademicSettingRepository {
  /**
   * The one settings row.
   *
   * Returns null only if the row is missing, which the migration makes
   * impossible in practice — the use case turns that into a clear failure
   * rather than inventing defaults nobody chose.
   */
  abstract find(): Promise<AcademicSettingEntity | null>;

  abstract update(
    id: string,
    input: AcademicSettingRepositoryInput,
  ): Promise<AcademicSettingEntity>;
}
