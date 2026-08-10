import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AttendanceDriver,
  PayrollRunKind,
  PayrollRunStatus,
  SalaryComponentType,
} from '@prisma/client';

/**
 * Money is a **string** on every field below.
 *
 * JSON numbers are IEEE-754 doubles, and a salary is the last place to accept
 * that; the frontend formats these with `Intl.NumberFormat('id-ID')`. Values are
 * whole rupiah — the rounding happened per line before they were stored.
 */
export class PayslipLineResponseDto {
  @ApiProperty() componentCode: string;
  @ApiProperty() componentName: string;
  @ApiProperty({ enum: SalaryComponentType })
  componentType: `${SalaryComponentType}`;
  @ApiProperty({ example: '3500000' }) amount: string;

  @ApiPropertyOptional({ enum: AttendanceDriver })
  driver: `${AttendanceDriver}` | null;
  @ApiPropertyOptional({ example: 3 }) driverCount: number | null;
  @ApiPropertyOptional({ example: '150000' }) rate: string | null;
}

export class PayslipAttendanceResponseDto {
  @ApiProperty() presentDays: number;
  @ApiProperty() absentDays: number;
  @ApiProperty() lateCount: number;
  @ApiProperty() lateMinutes: number;
  @ApiProperty() earlyLeaveCount: number;
  @ApiProperty() leaveDays: number;
  @ApiProperty() officialDutyDays: number;
}

export class PayslipRunResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() year: number;
  @ApiProperty() month: number;
  @ApiProperty({ enum: PayrollRunKind }) kind: `${PayrollRunKind}`;
  @ApiProperty({ enum: PayrollRunStatus }) status: `${PayrollRunStatus}`;
}

export class PayslipEmployeeResponseDto {
  @ApiProperty({ format: 'uuid' }) userId: string;
  @ApiPropertyOptional() displayName: string | null;
  @ApiProperty() identifier: string;
}

export class PayslipResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ type: PayslipRunResponseDto }) run: PayslipRunResponseDto;
  @ApiProperty({ type: PayslipEmployeeResponseDto })
  employee: PayslipEmployeeResponseDto;
  @ApiProperty({ type: PayslipAttendanceResponseDto })
  attendance: PayslipAttendanceResponseDto;
  @ApiProperty({ type: [PayslipLineResponseDto] })
  lines: PayslipLineResponseDto[];

  @ApiProperty({ example: '3650000' }) gross: string;
  @ApiProperty({ example: '150000' }) deductions: string;
  @ApiProperty({ example: '3500000' }) net: string;
}

export class PayslipSummaryResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ type: PayslipEmployeeResponseDto })
  employee: PayslipEmployeeResponseDto;
  @ApiProperty({ example: '3650000' }) gross: string;
  @ApiProperty({ example: '150000' }) deductions: string;
  @ApiProperty({ example: '3500000' }) net: string;
}
