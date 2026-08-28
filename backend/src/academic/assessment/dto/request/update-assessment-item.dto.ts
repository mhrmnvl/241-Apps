import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType } from '../../../../shared/domain/enums/assessment-type.enum.js';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAssessmentItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
  @ApiPropertyOptional({ enum: AssessmentType })
  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  // A mark is stored as a percentage of this, so a larger bound is
  // arithmetically harmless — but the school marks out of a hundred, and a task
  // set out of 1000 makes every rapor line read as a rounding error. The form
  // carries the same bound so it is caught before the request.
  @Max(100)
  maxScore?: number;
}
