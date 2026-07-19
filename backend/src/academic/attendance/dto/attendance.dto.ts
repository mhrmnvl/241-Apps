import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
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
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class CreateAttendanceDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() enrollmentId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() scheduleId?: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class AttendanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() enrollmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() scheduleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classroomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() semesterId?: string;
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
}

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

export class AttendanceRecapQueryDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() classroomId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() semesterId: string;
}
