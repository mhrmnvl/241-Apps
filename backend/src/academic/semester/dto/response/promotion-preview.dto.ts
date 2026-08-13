import { ApiProperty } from '@nestjs/swagger';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';

export class PromotionPreviewItemDto {
  @ApiProperty() action: PromotionAction;
  @ApiProperty() studentCount: number;
}

export class PromotionPreviewDto {
  @ApiProperty({ type: [PromotionPreviewItemDto] })
  items: PromotionPreviewItemDto[];
  @ApiProperty() totalStudents: number;
  @ApiProperty() promotedCount: number;
  @ApiProperty() repeatedCount: number;
}
