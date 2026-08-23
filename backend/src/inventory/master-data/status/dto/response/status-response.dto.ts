import { ApiProperty } from '@nestjs/swagger';

/**
 * Asset status reference data, as it leaves the server.
 *
 * Transcribed from what the repository returns: it selects no columns, so
 * Prisma hands back every scalar the model owns and all of them are on the
 * wire. `deletedAt` is one of them — it is always null, because deleting one of
 * these removes the row rather than marking it.
 */
export class InventoryStatusResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'TERSEDIA' }) code!: string;

  @ApiProperty({ example: 'Tersedia' }) name!: string;

  @ApiProperty({
    example: 'AVAILABLE',
    nullable: true,
    description:
      'Set on the rows the workflow reasons about, so renaming one in the ' +
      'interface cannot change what the code does with it.',
  })
  systemKey!: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Always null: these are removed outright, not soft-deleted.',
  })
  deletedAt!: Date | null;
}
