import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

/**
 * Every state transition carries the version the editor loaded. A transition is
 * a write like any other, and one taken against a stale copy is exactly the
 * silent overwrite FR-013 exists to prevent — unpublishing an article someone
 * else already rewrote is worse than refusing.
 */
export class PostVersionDto {
  @ApiProperty({
    description: 'Version the editor loaded; a mismatch returns 409.',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  version: number;
}

export class PinPostDto extends PostVersionDto {
  @ApiProperty({
    description: 'True pins the item to the top of its feed, false unpins it.',
  })
  @IsBoolean()
  pinned: boolean;
}
