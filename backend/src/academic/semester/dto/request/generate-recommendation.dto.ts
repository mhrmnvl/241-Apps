import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Promotion is addressed by academic year, not by semester.
 *
 * Moving a student up a grade is a thing that happens between years; moving
 * them between the terms of one year is a rollover, and has its own endpoint.
 * Asking for semesters let a caller name two terms of the same year, which
 * this then had to refuse — a state the screen could reach in two clicks.
 *
 * Which term of each year is read and written is settled here rather than by
 * the caller: the last term of the year being left, the first term of the year
 * being entered, ordered by `SemesterType.sequence`.
 */
export class GenerateRecommendationDto {
  @ApiProperty({
    description: 'Academic year the students are leaving, e.g. 2025/2026',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceAcademicYearId: string;

  @ApiProperty({
    description: 'Academic year the students are entering, e.g. 2026/2027',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  targetAcademicYearId: string;
}
