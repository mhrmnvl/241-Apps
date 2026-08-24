import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class BulkGraduationStudentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'DN-01/2026' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * A student the school decided not to graduate, and why.
 *
 * The reason is required here and nowhere else in this payload, because a hold
 * with no reason is a hold nobody can answer for next year — which is the
 * whole point of recording it.
 */
export class BulkGraduationHeldStudentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'Nilai belum lengkap' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}

export class BulkGraduationDto {
  /** One date for the whole cohort; a certificate number is still per student. */
  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsDateString()
  graduationDate?: string;

  /**
   * Capped at a thousand: this runs as a single transaction, and an unbounded
   * list would hold it open for as long as someone cared to make it.
   */
  @ApiProperty({ type: [BulkGraduationStudentDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => BulkGraduationStudentDto)
  students: BulkGraduationStudentDto[];

  /**
   * Recorded alongside the graduations, in the same transaction.
   *
   * Optional and allowed to be empty: a year where everyone finishes is the
   * ordinary case, and requiring an empty array would make the common run
   * carry ceremony for the rare one.
   */
  @ApiPropertyOptional({ type: [BulkGraduationHeldStudentDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => BulkGraduationHeldStudentDto)
  held?: BulkGraduationHeldStudentDto[];
}
