import { ApiProperty } from '@nestjs/swagger';
import { InventoryStatusKey } from '@prisma/client';

/**
 * An asset status, as it leaves the server.
 *
 * Transcribed from the Prisma model rather than from `InventoryStatusEntity`. The
 * repository selects no columns, so every scalar the model owns is on the
 * wire — and the entity interface is narrower than that, and wrong: it
 * declares a `deletedAt` this table does not have.
 */
export class InventoryStatusResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'TERSEDIA' }) code!: string;

  @ApiProperty({ example: 'Tersedia' }) name!: string;

  @ApiProperty({
    example: true,
    description: 'Whether an asset in this status may be borrowed or returned.',
  })
  allowTransactions!: boolean;

  @ApiProperty({
    enum: InventoryStatusKey,
    nullable: true,
    description:
      'Set only on the statuses the workflow reasons about, so renaming one ' +
      'in the interface cannot change what the code does with it.',
  })
  systemKey!: InventoryStatusKey | null;

  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
