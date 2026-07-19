import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Academic Year Name (e.g., 2024/2025)',
    example: '2025/2026',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Is current active academic year?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Copy classes from previous academic year? Defaults to true.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  copyClassesFromPreviousYear?: boolean;
}
