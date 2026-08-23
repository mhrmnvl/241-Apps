import { ApiProperty } from '@nestjs/swagger';

/**
 * Asset category reference data, as it leaves the server.
 *
 * Transcribed from what the repository returns: it selects no columns, so
 * Prisma hands back every scalar the model owns and all of them are on the
 * wire. `deletedAt` is one of them — it is always null, because deleting one of
 * these removes the row rather than marking it.
 */
export class InventoryCategoryResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'ELK' }) code!: string;

  @ApiProperty({ example: 'Elektronik' }) name!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Always null: these are removed outright, not soft-deleted.',
  })
  deletedAt!: Date | null;
}
