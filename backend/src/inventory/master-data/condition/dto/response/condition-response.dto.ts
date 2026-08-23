import { ApiProperty } from '@nestjs/swagger';

/**
 * An asset condition, as it leaves the server.
 *
 * Transcribed from the Prisma model rather than from `InventoryConditionEntity`. The
 * repository selects no columns, so every scalar the model owns is on the
 * wire — and the entity interface is narrower than that, and wrong: it
 * declares a `deletedAt` this table does not have.
 */
export class InventoryConditionResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'BAIK' }) code!: string;

  @ApiProperty({ example: 'Baik' }) name!: string;

  @ApiProperty({
    example: true,
    description: 'Whether an asset in this condition may still be lent out.',
  })
  isUsable!: boolean;

  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
