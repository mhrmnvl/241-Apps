import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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

  @ApiProperty({
    description:
      'The calendar year this school year opens in: 2026 for "2026/2027". ' +
      'Given rather than parsed out of the name — years are master data the ' +
      'school renames, and everything that needs them in order reads this.',
    example: 2026,
  })
  @IsInt()
  @Min(1900)
  @Max(2999)
  startYear: number;

  @ApiPropertyOptional({
    description: 'Is current active academic year?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
