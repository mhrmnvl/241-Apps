import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DayEnum as Day } from '../../../../shared/domain/enums/day.enum.js';

/** One lesson row of a batch submission — kept beside the payload that nests it. */
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
