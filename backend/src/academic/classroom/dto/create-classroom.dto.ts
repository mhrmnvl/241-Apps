import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ description: 'Curriculum ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  curriculumId: string;

  @ApiProperty({ description: 'Academic Year ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Classroom Level ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  gradeId: string;

  @ApiProperty({ description: 'Classroom code', example: 'VIII-A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional({ description: 'Classroom name', example: 'Awesome' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Class Capacity', example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  capacity: number;

  @ApiPropertyOptional({ description: 'Active Status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
