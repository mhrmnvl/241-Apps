import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class NonWorkingDayDto {
  @ApiProperty({ example: '2026-08-17' }) @IsDateString() date!: string;

  @ApiProperty({ example: 'HUT RI' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Provenance only — not a foreign key.',
  })
  @IsOptional()
  @IsUUID()
  sourceCalendarId?: string;
}

export class BulkNonWorkingDaysDto {
  @ApiProperty({ type: [NonWorkingDayDto] })
  @IsArray()
  @ArrayMaxSize(400)
  @ValidateNested({ each: true })
  @Type(() => NonWorkingDayDto)
  days!: NonWorkingDayDto[];
}
