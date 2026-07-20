import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GenerateReportCardDto {
  @IsUUID()
  enrollmentId: string;

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
