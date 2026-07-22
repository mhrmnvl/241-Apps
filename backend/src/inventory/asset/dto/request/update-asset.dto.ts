import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

// Parent/catalog fields only. Per-unit fields (barcode, serial, condition,
// status, location, custodian) are managed via the asset-unit endpoints.
export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'Asset name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Model or Type' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Batch/asset number' })
  @IsOptional()
  @IsString()
  assetNumber?: string;

  @ApiPropertyOptional({ description: 'Purchase Date' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Purchase Price (per unit)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Useful life in months' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usefulLifeMonths?: number;

  @ApiPropertyOptional({ description: 'Funding Source UUID' })
  @IsOptional()
  @IsUUID()
  fundingSourceId?: string;

  @ApiPropertyOptional({ description: 'Extra notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
