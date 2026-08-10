import {
  AttendanceDriverEnum,
  SalaryComponentTypeEnum,
} from '../../../component/domain/entities/salary-component.entity.js';

export interface SalaryAssignmentEntity {
  id: string;
  userId: string;
  componentId: string;
  /** Whole rupiah as a string — never a JSON number. */
  amount: string | null;
  rate: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdBy: string;
  deletedAt?: Date | null;
}

export interface SalaryAssignmentWithComponent extends SalaryAssignmentEntity {
  component: {
    id: string;
    code: string;
    name: string;
    type: SalaryComponentTypeEnum;
    driver: string | null;
  };
  holder: { id: string; displayName: string | null };
}

/** What the payroll run needs: the assignment in force on one date. */
export interface EffectiveAssignment {
  userId: string;
  componentId: string;
  componentCode: string;
  componentName: string;
  componentType: SalaryComponentTypeEnum;
  driver: AttendanceDriverEnum | null;
  amount: string | null;
  rate: string | null;
  effectiveFrom: Date;
}
