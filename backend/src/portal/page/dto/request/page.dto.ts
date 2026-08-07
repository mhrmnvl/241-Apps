import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'Visi & Misi', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Public address. Derived from the title when omitted.',
    maxLength: 220,
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiProperty({ description: 'HTML — sanitized server-side before storage' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;
}

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiProperty({ description: 'A mismatch returns 409.', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class PageVersionDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

/**
 * Exactly one destination. Modelled as three optional fields rather than a
 * discriminated union because that is the shape the table has, and the "exactly
 * one" rule is checked in the use case where the error message can explain it.
 */
export class CreateNavItemDto {
  @ApiProperty({ example: 'Profil', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  label: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Link to a portal page' })
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @ApiPropertyOptional({
    description: 'A built-in listing: berita, artikel, agenda, galeri',
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  routeKey?: string;

  @ApiPropertyOptional({
    description: 'An address outside the portal, e.g. the PPDB application',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  externalUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNavItemDto extends PartialType(CreateNavItemDto) {}

export class ReorderNavDto {
  @ApiProperty({
    type: [String],
    description: 'Item ids in the order they should render',
  })
  @IsUUID(undefined, { each: true })
  itemIds: string[];
}
