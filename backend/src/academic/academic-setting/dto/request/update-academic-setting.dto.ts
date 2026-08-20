import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import {
  WEEKDAY_COUNT,
  WEEKDAY_MAX,
  WEEKDAY_MIN,
} from '../../constants/weekday.constants.js';
import {
  PASSING_SCORE_MAX,
  PASSING_SCORE_MIN,
} from '../../constants/passing-score.constants.js';

export class UpdateAcademicSettingDto {
  @ApiPropertyOptional({
    description:
      'Weekdays school does not run, 0 (Sunday) to 6 (Saturday). ' +
      '[0] is a six-day week, [0, 6] a five-day week, [5] a Friday closure. ' +
      'An empty array means school runs every day.',
    example: [0],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(WEEKDAY_COUNT)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(WEEKDAY_MIN, { each: true })
  @Max(WEEKDAY_MAX, { each: true })
  @Type(() => Number)
  weeklyHolidays?: number[];

  @ApiPropertyOptional({
    description:
      'Pass mark used when neither the teaching assignment nor the curriculum ' +
      'sets one for a subject.',
    example: 75,
    minimum: PASSING_SCORE_MIN,
    maximum: PASSING_SCORE_MAX,
  })
  @IsOptional()
  @IsInt()
  @Min(PASSING_SCORE_MIN)
  @Max(PASSING_SCORE_MAX)
  @Type(() => Number)
  defaultPassingScore?: number;
}
