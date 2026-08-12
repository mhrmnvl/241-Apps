import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ description: 'Asset name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'Number of physical units to create (each gets its own number)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'Category UUID' })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Model or Type' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Barcode identifier' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Custom asset number' })
  @IsOptional()
  @IsString()
  assetNumber?: string;

  @ApiProperty({ description: 'Purchase Date' })
  @IsNotEmpty()
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ description: 'Purchase Price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiPropertyOptional({ description: 'Useful life in months' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usefulLifeMonths?: number;

  @ApiPropertyOptional({ description: 'Funding Source UUID' })
  @IsOptional()
  @IsUUID()
  fundingSourceId?: string;

  @ApiProperty({ description: 'Location UUID' })
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ description: 'Status UUID' })
  @IsNotEmpty()
  @IsUUID()
  statusId: string;

  @ApiProperty({ description: 'Condition UUID' })
  @IsNotEmpty()
  @IsUUID()
  conditionId: string;

  @ApiPropertyOptional({ description: 'Extra notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
