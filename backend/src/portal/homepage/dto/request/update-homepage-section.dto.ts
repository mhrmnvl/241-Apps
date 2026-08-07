import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  MAX_SECTION_ITEMS,
  MIN_SECTION_ITEMS,
} from '../../constants/homepage.constants.js';

export class UpdateHomepageSectionDto {
  @ApiPropertyOptional({
    minimum: MIN_SECTION_ITEMS,
    maximum: MAX_SECTION_ITEMS,
    description: 'How many items this section shows on the public homepage',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_SECTION_ITEMS)
  @Max(MAX_SECTION_ITEMS)
  itemCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
