import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DayEnum as Day } from '../../../../shared/domain/enums/day.enum.js';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto.js';

export class ScheduleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() teachingAssignmentId?: string;
  @ApiPropertyOptional({ enum: Day }) @IsOptional() @IsEnum(Day) day?: Day;
  @ApiPropertyOptional() @IsOptional() @IsUUID() timeSlotId?: string;
}

/*
 * `classroomId` used to be declared here and advertised in Swagger, but
 * `findSchedulePage` never read it — the filter silently did nothing. Removing
 * it changes no behaviour and stops the contract promising a filter it does not
 * apply. Fetching a classroom's schedule goes through `findByClassroom`
 * (GET /schedules/classroom/:id), which is what the frontend already uses.
 */
