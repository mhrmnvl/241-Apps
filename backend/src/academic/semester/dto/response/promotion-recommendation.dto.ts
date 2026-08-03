import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';

export class PromotionRecommendationItemDto {
  @ApiProperty() studentId: string;
  @ApiProperty() studentName: string;
  @ApiProperty() nis: string;
  @ApiProperty() sourceClassroomId: string;
  @ApiProperty() sourceClassroomName: string;
  @ApiProperty() sourceLevel: string;
  @ApiProperty({ enum: PromotionAction }) recommendedAction: PromotionAction;
  @ApiPropertyOptional() targetClassroomId?: string;
  @ApiPropertyOptional() targetClassroomName?: string;
  @ApiPropertyOptional() targetLevel?: string;
  @ApiPropertyOptional() averageScore?: number | null;
}

export class PromotionRecommendationDto {
  @ApiProperty({ type: [PromotionRecommendationItemDto] })
  items: PromotionRecommendationItemDto[];

  @ApiProperty() totalStudents: number;
}
