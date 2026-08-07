import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class PublishPostDto {
  @ApiProperty({
    description: 'Version the editor loaded; a mismatch returns 409.',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;

  @ApiPropertyOptional({
    description:
      'Go live at this moment instead of now. Must be in the future. The item becomes public when this passes, whether or not the status-normalising job has run.',
    example: '2026-08-09T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
