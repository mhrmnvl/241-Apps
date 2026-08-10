import {
  AttendanceDriverEnum,
  SalaryComponentTypeEnum,
} from '../../../component/domain/entities/salary-component.entity.js';

/**
 * The attendance the run actually used, copied onto the payslip.
 *
 * Stored as columns rather than read back from presence at display time: a
 * payslip has to stay defensible years later, and a later attendance correction
 * must not silently change a figure that has already been paid.
 */
export interface PayslipAttendance {
  presentDays: number;
  absentDays: number;
  lateCount: number;
  lateMinutes: number;
  earlyLeaveCount: number;
  leaveDays: number;
  officialDutyDays: number;
}

/**
 * Component code and name are denormalised so the line still reads correctly
 * after the component is renamed or retired.
 */
export interface PayslipLineEntity {
  componentId: string | null;
  componentCode: string;
  componentName: string;
  componentType: SalaryComponentTypeEnum;
  /** Already rounded to whole rupiah — see `RoundingService`. */
  amount: number;
  driver: AttendanceDriverEnum | null;
  driverCount: number | null;
  rate: string | null;
}

/** One employee's calculated month, before it is written. */
export interface ComposedPayslip {
  userId: string;
  gross: number;
  deductions: number;
  net: number;
  attendance: PayslipAttendance;
  lines: PayslipLineEntity[];
}
