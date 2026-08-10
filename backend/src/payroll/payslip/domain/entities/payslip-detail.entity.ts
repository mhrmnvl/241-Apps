import {
  AttendanceDriverEnum,
  SalaryComponentTypeEnum,
} from '../../../component/domain/entities/salary-component.entity.js';
import {
  PayrollRunKindEnum,
  PayrollRunStatusEnum,
} from '../../../run/domain/entities/payroll-run.entity.js';
import { PayslipAttendance } from '../../../run/domain/entities/payslip.entity.js';

export type { PayslipAttendance };

/** Every amount is a whole-rupiah string, never a JSON number. */
export interface PayslipLineView {
  componentCode: string;
  componentName: string;
  componentType: SalaryComponentTypeEnum;
  amount: string;
  driver: AttendanceDriverEnum | null;
  driverCount: number | null;
  rate: string | null;
}

export interface PayslipRunRef {
  id: string;
  year: number;
  month: number;
  kind: PayrollRunKindEnum;
  status: PayrollRunStatusEnum;
}

export interface PayslipEmployeeRef {
  userId: string;
  displayName: string | null;
  identifier: string;
}

export interface PayslipDetail {
  id: string;
  run: PayslipRunRef;
  employee: PayslipEmployeeRef;
  attendance: PayslipAttendance;
  lines: PayslipLineView[];
  gross: string;
  deductions: string;
  net: string;
}

/** One row of a run's payslip list — totals without the line breakdown. */
export interface PayslipSummary {
  id: string;
  employee: PayslipEmployeeRef;
  gross: string;
  deductions: string;
  net: string;
}
