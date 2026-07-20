import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
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
}

export class UpdateStatusDto extends PartialType(CreateStatusDto) {}
