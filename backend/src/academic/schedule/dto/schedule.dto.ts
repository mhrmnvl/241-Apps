import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Day } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination.dto.js';

export class CreateScheduleDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() teachingAssignmentId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() timeSlotId: string;
  @ApiProperty({ enum: Day }) @IsEnum(Day) day: Day;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) room?: string;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() teachingAssignmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() timeSlotId?: string;
  @ApiPropertyOptional({ enum: Day }) @IsOptional() @IsEnum(Day) day?: Day;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) room?: string;
}

export class ScheduleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() teachingAssignmentId?: string;
  @ApiPropertyOptional({ enum: Day }) @IsOptional() @IsEnum(Day) day?: Day;
  @ApiPropertyOptional() @IsOptional() @IsUUID() timeSlotId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classroomId?: string;
}

export class BatchScheduleRowDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() timeSlotId: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() subjectId: string;
}

export class BatchUpsertScheduleDto {
  @ApiProperty({ enum: Day }) @IsEnum(Day) day: Day;

  @ApiProperty({ type: [BatchScheduleRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchScheduleRowDto)
  lessons: BatchScheduleRowDto[];
}
