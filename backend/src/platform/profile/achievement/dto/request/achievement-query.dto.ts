import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AchievementQueryDto {
  @ApiPropertyOptional({ description: 'Filter by profile ID' })
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiPropertyOptional({ description: 'Filter by achievement type ID' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
