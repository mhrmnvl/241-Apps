import { ApiProperty } from '@nestjs/swagger';

/**
 * An asset category, as it leaves the server.
 *
 * Transcribed from the Prisma model rather than from `InventoryCategoryEntity`.
 * The repository selects no columns, so what reaches the client is every scalar
 * the model owns — and the entity interface is narrower than that, and wrong:
 * it declares a `deletedAt` this table does not have and omits three fields it
 * does. A response type copied from it would have described something the
 * server never sends, which is the defect this whole exercise is about.
 */
export class InventoryCategoryResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({ example: 'ELK' }) code!: string;

  @ApiProperty({ example: 'Elektronik' }) name!: string;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'Categories nest; null at the top of a tree.',
  })
  parentId!: string | null;

  @ApiProperty({
    type: String,
    example: '12.50',
    description:
      'A string, not a number: the column is `Decimal(5,2)`, and Prisma hands ' +
      'a Decimal back as its string form so no precision is lost on the way.',
  })
  depreciationRatePercent!: string;

  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
