import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'CUTI_MELAHIRKAN' })
  @Matches(/^[A-Z][A-Z0-9_]{1,29}$/, {
    message: 'code must be UPPER_SNAKE_CASE',
  })
  code!: string;

  @ApiProperty({ example: 'Cuti Melahirkan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    enum: ['ON_LEAVE', 'OFFICIAL_DUTY'],
    description:
      'OFFICIAL_DUTY means working elsewhere — it must not read as leave in a recap.',
  })
  @IsIn(['ON_LEAVE', 'OFFICIAL_DUTY'])
  treatment!: 'ON_LEAVE' | 'OFFICIAL_DUTY';

  @ApiProperty() @IsBoolean() consumesQuota!: boolean;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  annualQuota?: number;

  @ApiProperty() @IsBoolean() requiresDocument!: boolean;

  @ApiProperty({ enum: ['STUDENT', 'EMPLOYEE'] })
  @IsIn(['STUDENT', 'EMPLOYEE'])
  appliesTo!: PresenceSubjectTypeEnum;
}
