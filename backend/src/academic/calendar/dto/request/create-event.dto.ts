import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Pekan Ilmiah Siswa',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Kegiatan pameran karya ilmiah siswa kelas 7-9.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description:
      'Target audience group IDs. Send empty array [] or omit for a school-wide/general event.',
    type: [String],
    format: 'uuid',
    example: ['550e8400-e29b-41d4-a716-446655440005'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  audienceGroupIds?: string[];

  @ApiProperty({
    description: 'Start time (ISO 8601)',
    example: '2024-03-05T08:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time (ISO 8601)',
    example: '2024-03-05T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    description:
      'Target classroom IDs. Send empty array [] or omit for a general (school-wide) event.',
    type: [String],
    format: 'uuid',
    example: ['550e8400-e29b-41d4-a716-446655440004'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classroomIds?: string[];
}
