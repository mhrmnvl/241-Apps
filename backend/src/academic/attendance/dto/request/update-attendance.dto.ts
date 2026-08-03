import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../../../../shared/domain/enums/attendance-status.enum.js';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}
