import { ApiProperty } from '@nestjs/swagger';
import { InventoryCategoryResponseDto } from '../../category/dto/response/category-response.dto.js';
import { InventoryConditionResponseDto } from '../../condition/dto/response/condition-response.dto.js';
import { InventoryFundingSourceResponseDto } from '../../funding-source/dto/response/funding-source-response.dto.js';
import { InventoryLocationResponseDto } from '../../location/dto/response/location-response.dto.js';
import { InventoryStatusResponseDto } from '../../status/dto/response/status-response.dto.js';

/**
 * Every inventory dropdown in one request.
 *
 * The five lists are the same rows the five list endpoints serve, fetched
 * together so a form that needs all of them does not make five calls. Each
 * names the module's own response type rather than restating its fields, so a
 * column added to a category cannot appear here and nowhere else.
 */
export class InventoryMetadataResponseDto {
  @ApiProperty({ type: () => [InventoryCategoryResponseDto] })
  categories!: InventoryCategoryResponseDto[];

  @ApiProperty({ type: () => [InventoryLocationResponseDto] })
  locations!: InventoryLocationResponseDto[];

  @ApiProperty({ type: () => [InventoryConditionResponseDto] })
  conditions!: InventoryConditionResponseDto[];

  @ApiProperty({ type: () => [InventoryStatusResponseDto] })
  statuses!: InventoryStatusResponseDto[];

  @ApiProperty({ type: () => [InventoryFundingSourceResponseDto] })
  fundingSources!: InventoryFundingSourceResponseDto[];
}
