import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { GenerateRecommendationDto } from '../dto/request/generate-recommendation.dto.js';
import { PromotionRecommendationDto } from '../dto/response/promotion-recommendation.dto.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import { PromotionPreviewDto } from '../dto/response/promotion-preview.dto.js';
import { PromotionResultDto } from '../dto/response/promotion-result.dto.js';
import { GeneratePromotionRecommendationUseCase } from '../use-cases/generate-promotion-recommendation.use-case.js';
import { PreviewPromotionUseCase } from '../use-cases/preview-promotion.use-case.js';
import { PromoteStudentsUseCase } from '../use-cases/promote-student.use-case.js';

@ApiTags('Semesters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('semesters/promote')
export class SemesterPromotionController {
  constructor(
    private readonly promoteStudentsService: PromoteStudentsUseCase,
    private readonly previewPromotionService: PreviewPromotionUseCase,
    private readonly generateRecommendationService: GeneratePromotionRecommendationUseCase,
  ) {}

  @Post('recommend')
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary:
      'Generate per-student promotion recommendations based on class level',
  })
  @ApiResponse({
    status: 200,
    description: 'List of students with recommended promotion actions',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async recommend(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: GenerateRecommendationDto,
  ): Promise<PromotionRecommendationDto> {
    return this.generateRecommendationService.execute(dto);
  }

  @Post('preview')
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary: 'Preview promotion summary counts from per-student decisions',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion preview with student counts per action',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async previewPromotion(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: PromotionDto,
  ): Promise<PromotionPreviewDto> {
    return this.previewPromotionService.execute(dto);
  }

  @Post()
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary:
      'Execute batch student promotion across academic years (PROMOTE/REPEAT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion result with counts',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester or class not found' })
  async promote(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: PromotionDto,
  ): Promise<PromotionResultDto> {
    return this.promoteStudentsService.execute(dto);
  }
}
