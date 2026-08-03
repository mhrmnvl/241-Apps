import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../../../../shared/domain/enums/attendance-status.enum.js';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

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
