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

  /**
   * Final-year students, who are not part of a promotion run.
   *
   * Reported rather than silently omitted: a promotion that quietly leaves the
   * graduating cohort out of both its list and its counts is how a year ends
   * with those students still enrolled and nobody noticing.
   */
  @ApiProperty({
    description:
      'Final-year students excluded from this run; graduate them under Kelulusan',
  })
  excludedGraduatingCount: number;
}
