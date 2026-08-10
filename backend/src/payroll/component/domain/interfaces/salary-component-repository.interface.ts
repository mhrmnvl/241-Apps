import {
  AttendanceDriverEnum,
  SalaryComponentEntity,
  SalaryComponentTypeEnum,
} from '../entities/salary-component.entity.js';

export type { SalaryComponentEntity };

export interface CreateSalaryComponentInput {
  code: string;
  name: string;
  type: SalaryComponentTypeEnum;
  driver?: AttendanceDriverEnum | null;
}

export type UpdateSalaryComponentInput = Partial<CreateSalaryComponentInput> & {
  isActive?: boolean;
};

export abstract class ISalaryComponentRepository {
  abstract findAll(includeInactive?: boolean): Promise<SalaryComponentEntity[]>;
  abstract findById(id: string): Promise<SalaryComponentEntity | null>;
  abstract findByCode(code: string): Promise<SalaryComponentEntity | null>;
  abstract create(
    input: CreateSalaryComponentInput,
  ): Promise<SalaryComponentEntity>;
  abstract update(
    id: string,
    input: UpdateSalaryComponentInput,
  ): Promise<SalaryComponentEntity>;
  abstract softDelete(id: string): Promise<SalaryComponentEntity>;
  abstract countAssignments(componentId: string): Promise<number>;
}
