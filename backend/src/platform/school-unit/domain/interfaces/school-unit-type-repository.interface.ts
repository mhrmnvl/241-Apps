import { SchoolUnitTypeEntity } from '../entities/school-unit-type.entity.js';

export interface CreateSchoolUnitTypeRepositoryInput {
  code: string;
  name: string;
}

export type UpdateSchoolUnitTypeRepositoryInput =
  Partial<CreateSchoolUnitTypeRepositoryInput>;

export abstract class ISchoolUnitTypeRepository {
  abstract findAll(): Promise<SchoolUnitTypeEntity[]>;
  abstract findById(id: string): Promise<SchoolUnitTypeEntity | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<SchoolUnitTypeEntity | null>;
  abstract create(
    input: CreateSchoolUnitTypeRepositoryInput,
  ): Promise<SchoolUnitTypeEntity>;
  abstract update(
    id: string,
    input: UpdateSchoolUnitTypeRepositoryInput,
  ): Promise<SchoolUnitTypeEntity>;
  abstract remove(id: string): Promise<SchoolUnitTypeEntity>;
  abstract countSchoolUnitsWithType(id: string): Promise<number>;
}
