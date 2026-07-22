import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class BulkStudentScoreRecordDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() enrollmentId: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  score?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class BulkUpsertStudentScoreDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() assessmentItemId: string;
  @ApiProperty({ type: [BulkStudentScoreRecordDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkStudentScoreRecordDto)
  records: BulkStudentScoreRecordDto[];
}
