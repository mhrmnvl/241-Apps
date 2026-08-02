import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryStatusKey } from '../../../../../shared/domain/enums/inventory-status-key.enum.js';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStatusDto {
  @ApiProperty({ example: 'STATUS-ACTIVE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Aktif' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  allowTransactions?: boolean;

  @ApiPropertyOptional({
    description:
      'Protected role of this status in the loan lifecycle (null = custom, no special role).',
    enum: InventoryStatusKey,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(InventoryStatusKey)
  systemKey?: InventoryStatusKey | null;
}
