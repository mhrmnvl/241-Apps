import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty({ description: 'Profile ID of the owner' })
  @IsUUID()
  profileId: string;

  @ApiProperty({ example: 'Olimpiade Matematika Nasional' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'Juara 1',
    description: 'Free-text achievement rank/title',
  })
  @IsString()
  @MaxLength(100)
  level: string;

  @ApiProperty({
    example: 'achievement-type-uuid',
    description: 'Achievement Type ID',
  })
  @IsUUID()
  typeId: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
