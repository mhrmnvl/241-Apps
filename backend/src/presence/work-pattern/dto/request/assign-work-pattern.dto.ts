import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class AssignWorkPatternDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() userId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() workPatternId!: string;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Any earlier open assignment is closed the day before this.',
  })
  @IsDateString()
  effectiveFrom!: string;
}
