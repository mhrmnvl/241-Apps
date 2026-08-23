import { ApiProperty } from '@nestjs/swagger';

/**
 * An asset funding source, as it leaves the server.
 *
 * Transcribed from the Prisma model rather than from `InventoryFundingSourceEntity`. The
 * repository selects no columns, so every scalar the model owns is on the
 * wire — and the entity interface is narrower than that, and wrong: it
 * declares a `deletedAt` this table does not have.
 */
export class InventoryFundingSourceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'BOS' }) code!: string;

  @ApiProperty({ example: 'Dana BOS' }) name!: string;

  @ApiProperty({ nullable: true }) description!: string | null;

  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
