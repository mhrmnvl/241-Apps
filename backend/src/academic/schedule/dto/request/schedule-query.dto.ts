import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DayEnum as Day } from '../../../../shared/domain/enums/day.enum.js';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

export class ScheduleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() teachingAssignmentId?: string;
  @ApiPropertyOptional({ enum: Day }) @IsOptional() @IsEnum(Day) day?: Day;
  @ApiPropertyOptional() @IsOptional() @IsUUID() timeSlotId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classroomId?: string;
}
