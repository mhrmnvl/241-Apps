import { SchoolUnitInputDto } from '../entities/school-unit.entity.js';
import { SchoolUnitWithDetails } from '../entities/school-unit.entity.js';

export type { SchoolUnitWithDetails };

export abstract class ISchoolUnitRepository {
  abstract findFirst(): Promise<SchoolUnitWithDetails | null>;
  abstract findById(id: string): Promise<SchoolUnitWithDetails | null>;
  abstract create(dto: SchoolUnitInputDto): Promise<SchoolUnitWithDetails>;
  abstract update(
    id: string,
    dto: SchoolUnitInputDto,
  ): Promise<SchoolUnitWithDetails>;
}
