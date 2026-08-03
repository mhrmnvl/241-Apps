import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../../../../shared/domain/enums/attendance-status.enum.js';

/** One row of a bulk submission — kept beside the payload that nests it. */
export class BulkAttendanceRecordDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() enrollmentId: string;
  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class BulkUpsertAttendanceDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() scheduleId?: string;
  @ApiProperty({ type: [BulkAttendanceRecordDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceRecordDto)
  records: BulkAttendanceRecordDto[];
}
