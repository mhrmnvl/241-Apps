import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class AttendanceSuggestionQueryDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() classroomId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() semesterId!: string;
  @ApiProperty({ example: '2026-08-10' }) @IsDateString() date!: string;
}
