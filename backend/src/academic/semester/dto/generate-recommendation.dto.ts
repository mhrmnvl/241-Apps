import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PromotionAction } from './promotion.dto.js';

export class GenerateRecommendationDto {
  @ApiProperty({
    description: 'Source semester ID (current semester)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sourceSemesterId: string;

  @ApiProperty({
    description: 'Target semester ID (next academic year semester)',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  targetSemesterId: string;
}

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
