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

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Announcement title',
    example: 'Jadwal Ujian Akhir Semester',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Announcement description',
    example:
      'Ujian akhir semester genap dilaksanakan pada tanggal 20-25 Mei 2025.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Date (ISO 8601)', example: '2024-03-05' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description:
      'Target classroom IDs. Send empty array [] or omit for a general (school-wide) announcement.',
    type: [String],
    format: 'uuid',
    example: ['550e8400-e29b-41d4-a716-446655440004'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classroomIds?: string[];
}
