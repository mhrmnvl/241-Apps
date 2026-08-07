import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty({ example: 'Pentas Seni 2026', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ maxLength: 220 })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-12-20',
    description:
      'When the activity happened — not when the album was published. An album uploaded in March may document an event from January.',
  })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  coverFileId?: string;
}

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {
  @ApiProperty({ description: 'A mismatch returns 409.', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class AlbumVersionDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class PublishAlbumDto extends AlbumVersionDto {
  @ApiPropertyOptional({ description: 'Must be in the future when given.' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class AddPhotoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fileId: string;

  @ApiProperty({
    maxLength: 300,
    description:
      'Required. A gallery of images with no descriptions is unusable with a screen reader (FR-057).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  altText: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string;
}

/**
 * Caption and alt text only. The file itself is replaced by removing the photo
 * and adding it again — an in-place swap would silently change what every
 * existing link and cached preview points at.
 */
export class UpdatePhotoDto {
  @ApiPropertyOptional({ maxLength: 300, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string | null;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  altText?: string;
}

export class ReorderPhotosDto {
  @ApiProperty({
    type: [String],
    description: 'Photo ids in the order they should appear',
  })
  @IsUUID(undefined, { each: true })
  photoIds: string[];
}

export class AlbumQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Photos are paginated separately from the album so a 50-photo album is usable
 * within a few seconds on a mobile connection (FR-050, SC-015) — the first page
 * renders while the rest is still coming.
 */
export class PublicAlbumQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 24, maximum: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  limit?: number = 24;
}
