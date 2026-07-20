import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateReportCardDto {
  @IsOptional()
  @IsString()
  teacherNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rank?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
