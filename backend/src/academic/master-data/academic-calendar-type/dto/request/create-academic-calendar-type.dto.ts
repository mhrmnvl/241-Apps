import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAcademicCalendarTypeDto {
  @ApiProperty({
    description: 'Name of the academic-calendar-type',
    example: 'Active Value',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Whether this academic-calendar-type is currently active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
