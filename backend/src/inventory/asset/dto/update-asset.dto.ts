import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Factory Serial Number' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Barcode identifier' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Custom asset number' })
  @IsOptional()
  @IsString()
  assetNumber?: string;

  @ApiPropertyOptional({ description: 'Purchase Date' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Purchase Price' })
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

  @ApiPropertyOptional({ description: 'Location UUID' })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Status UUID' })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({ description: 'Condition UUID' })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

  @ApiPropertyOptional({ description: 'Extra notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
