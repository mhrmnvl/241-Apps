import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class DecideLeaveRequestDto {
  @ApiProperty({
    example: 'Clashes with the exam timetable',
    description: 'Required on rejection — the requester is told why (FR-031).',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;
}
