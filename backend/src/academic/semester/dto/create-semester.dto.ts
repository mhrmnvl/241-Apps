import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({
    description: 'Academic Year ID this semester belongs to',
    example: '550e8400-e29b-41d4-a716-446655440009',
  })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({
    description: 'Semester type ID (master data)',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @ApiPropertyOptional({
    description: 'Semester start date',
    example: '2025-07-14',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Semester end date',
    example: '2025-12-20',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Is current active semester?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
