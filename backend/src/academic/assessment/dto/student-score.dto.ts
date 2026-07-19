import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class CreateStudentScoreDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() enrollmentId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() assessmentItemId: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  score?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateStudentScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  score?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class StudentScoreQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() enrollmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assessmentItemId?: string;
}
