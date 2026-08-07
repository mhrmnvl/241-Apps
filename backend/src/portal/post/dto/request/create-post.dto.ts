import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostType } from '../../domain/enums/post-type.enum.js';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, example: PostType.BERITA })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ example: 'Juara 1 Olimpiade Matematika Tingkat Kabupaten' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description:
      'Short excerpt shown in listings and used as the default meta description',
    example:
      'Santri kelas VIII meraih juara 1 pada olimpiade tingkat kabupaten.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  summary: string;

  @ApiProperty({
    description: 'Rich text body. Sanitized server-side before it is stored.',
    example: '<p>Alhamdulillah, santri kami...</p>',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Override the slug generated from the title',
    example: 'juara-1-olimpiade-matematika',
  })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  coverFileId?: string;

  @ApiPropertyOptional({ example: 'Penyerahan piala di aula madrasah' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverAltText?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description:
      'Tag labels. Sent as names, not ids — tags are created on first use, so the editor types rather than picks (FR-038).',
    type: [String],
    example: ['olimpiade', 'matematika'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  tags?: string[];

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

  @ApiPropertyOptional({
    description: 'PENGUMUMAN only — rejected for BERITA and ARTIKEL',
    example: '2026-09-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'PENGUMUMAN only — downloadable attachment',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  attachmentFileId?: string;
}
