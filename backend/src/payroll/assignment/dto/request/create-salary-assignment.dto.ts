import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';

/** Money arrives as a string — a JSON number is an IEEE-754 double. */
const MONEY = /^\d{1,13}(\.\d{1,2})?$/;

export class CreateSalaryAssignmentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() userId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() componentId!: string;

  @ApiPropertyOptional({
    example: '3500000.00',
    description: 'For BASE, ALLOWANCE and fixed DEDUCTION.',
  })
  @IsOptional()
  @Matches(MONEY, { message: 'amount must be a decimal string' })
  amount?: string;

  @ApiPropertyOptional({
    example: '150000.00',
    description: 'Per unit of the driver, for any component that has one.',
  })
  @IsOptional()
  @Matches(MONEY, { message: 'rate must be a decimal string' })
  rate?: string;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Any earlier open assignment is closed the day before this.',
  })
  @IsDateString()
  effectiveFrom!: string;
}
