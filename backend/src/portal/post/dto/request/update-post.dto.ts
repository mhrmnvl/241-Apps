import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePostDto } from './create-post.dto.js';

/**
 * `type` is omitted on purpose: a Berita does not become an Artikel by edit —
 * its public address lives in a different space, and changing it would break
 * every link already shared.
 */
export class UpdatePostDto extends PartialType(
  OmitType(CreatePostDto, ['type'] as const),
) {
  @ApiProperty({
    description:
      'Version the editor loaded. A mismatch returns 409 rather than overwriting a concurrent save.',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}
