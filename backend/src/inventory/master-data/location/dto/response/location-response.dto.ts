import { ApiProperty } from '@nestjs/swagger';

/**
 * An asset location, as it leaves the server.
 *
 * Transcribed from the Prisma model rather than from `InventoryLocationEntity`. The
 * repository selects no columns, so every scalar the model owns is on the
 * wire — and the entity interface is narrower than that, and wrong: it
 * declares a `deletedAt` this table does not have.
 */
export class InventoryLocationResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'LAB1' }) code!: string;

  @ApiProperty({ example: 'Laboratorium 1' }) name!: string;

  @ApiProperty({ example: 'Gedung A', nullable: true })
  building!: string | null;

  @ApiProperty({ example: 'R-08', nullable: true }) room!: string | null;

  @ApiProperty({ example: 'Rak 3', nullable: true }) rack!: string | null;

  @ApiProperty({ nullable: true }) description!: string | null;

  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
