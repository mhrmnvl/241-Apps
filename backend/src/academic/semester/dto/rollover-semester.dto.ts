import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RolloverSemesterDto {
  @ApiProperty({
    description: 'Source semester ID to copy data from',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceSemesterId: string;

  @ApiProperty({
    description: 'Target semester ID to copy data into',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  targetSemesterId: string;
}

export class RolloverCategoryResultDto {
  created: number;
  skipped: number;
}

export class RolloverSummaryDto {
  classrooms: RolloverCategoryResultDto;
  enrollments: RolloverCategoryResultDto;
  supervisors: RolloverCategoryResultDto;
  teachingAssignments: RolloverCategoryResultDto;
  schedules: RolloverCategoryResultDto;
}
