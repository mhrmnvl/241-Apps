import { SchoolUnitTypeEntity } from '../entities/school-unit-type.entity.js';

export abstract class ISchoolUnitTypeRepository {
  abstract findAll(): Promise<SchoolUnitTypeEntity[]>;
  abstract findById(id: string): Promise<SchoolUnitTypeEntity | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SchoolUnitTypeEntity | null>;
  abstract create(dto: {
    code: string;
    name: string;
  }): Promise<SchoolUnitTypeEntity>;
  abstract update(
    id: string,
    dto: { code?: string; name?: string },
  ): Promise<SchoolUnitTypeEntity>;
  abstract remove(id: string): Promise<SchoolUnitTypeEntity>;
  abstract countSchoolUnitsWithType(id: string): Promise<number>;
}
