import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEducationalHistoryDto {
  @ApiProperty({ description: 'Profile ID of the owner' })
  @IsUUID()
  profileId: string;
  @ApiProperty({ example: 'SMA' })
  @IsString()
  @MaxLength(50)
  level: string;

  @ApiProperty({ example: 'SMAN 1 Malang' })
  @IsString()
  @MaxLength(200)
  institution: string;

  @ApiPropertyOptional({ example: 'IPA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  major?: string;

  @ApiProperty({ example: 2018 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  startYear: number;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  endYear?: number;

  @ApiPropertyOptional({
    enum: EducationStatus,
    default: EducationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EducationStatus)
  status?: EducationStatus;
}
