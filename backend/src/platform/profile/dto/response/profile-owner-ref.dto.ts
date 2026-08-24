import { ApiProperty } from '@nestjs/swagger';

/**
 * Who a profile record belongs to, as the three sub-modules attach it.
 *
 * Achievements, educational histories and scholarships all include their
 * profile through the same narrow select — `{ id, name, userId }` — so they
 * name this rather than each restating it. Widening it here widens all three
 * at once, which is the point: `Profile` owns sixteen identifying columns, and
 * this is the shape that deliberately is not them.
 */
export class ProfileOwnerRefDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'Siti Aminah' }) name!: string;

  @ApiProperty({ format: 'uuid' }) userId!: string;
}
