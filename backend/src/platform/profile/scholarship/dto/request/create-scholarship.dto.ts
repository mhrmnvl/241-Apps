import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScholarshipStatus } from '@prisma/client';
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

export class CreateScholarshipDto {
  @ApiProperty({ description: 'Profile ID of the owner' })
  @IsUUID()
  profileId: string;

  @ApiProperty({ example: 'Beasiswa Prestasi Unggulan' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Kemendikbud' })
  @IsString()
  @MaxLength(200)
  provider: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({
    enum: ScholarshipStatus,
    default: ScholarshipStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ScholarshipStatus)
  status?: ScholarshipStatus;
}
