import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CreateSemesterDto } from '../dto/request/create-semester.dto.js';
import {
  GenerateRecommendationDto,
  PromotionRecommendationDto,
} from '../dto/request/generate-recommendation.dto.js';
import {
  PromotionDto,
  PromotionPreviewDto,
  PromotionResultDto,
} from '../dto/request/promotion.dto.js';
import {
  RolloverSemesterDto,
  RolloverSummaryDto,
} from '../dto/request/rollover-semester.dto.js';
import { SemesterQueryDto } from '../dto/request/semester-query.dto.js';
import {
  SemesterListResponseDto,
  SemesterResponseDto,
} from '../dto/response/semester-response.dto.js';
import { UpdateSemesterDto } from '../dto/request/update-semester.dto.js';
import { ActivateSemesterUseCase } from '../use-cases/activate-semester.use-case.js';
import { CreateSemesterUseCase } from '../use-cases/create-semester.use-case.js';
import { DeactivateSemesterUseCase } from '../use-cases/deactivate-semester.use-case.js';
import { DeleteSemesterUseCase } from '../use-cases/delete-semester.use-case.js';
import { GeneratePromotionRecommendationUseCase } from '../use-cases/generate-promotion-recommendation.use-case.js';
import { GetSemesterByIdUseCase } from '../use-cases/get-semester-by-id.use-case.js';
import { GetSemestersUseCase } from '../use-cases/get-semesters.use-case.js';
import { PreviewPromotionUseCase } from '../use-cases/preview-promotion.use-case.js';
import { PromoteStudentsUseCase } from '../use-cases/promote-student.use-case.js';
import { RolloverSemesterUseCase } from '../use-cases/rollover-semester.use-case.js';
import { UpdateSemesterUseCase } from '../use-cases/update-semester.use-case.js';
import { SemesterWithDetails } from '../domain/interfaces/semester-repository.interface.js';

@ApiTags('Semesters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('semesters')
export class SemesterController {
  constructor(
    private readonly getSemestersService: GetSemestersUseCase,
    private readonly getSemesterByIdService: GetSemesterByIdUseCase,
    private readonly createSemesterService: CreateSemesterUseCase,
    private readonly updateSemesterService: UpdateSemesterUseCase,
    private readonly deleteSemesterService: DeleteSemesterUseCase,
    private readonly rolloverSemesterService: RolloverSemesterUseCase,
    private readonly promoteStudentsService: PromoteStudentsUseCase,
    private readonly previewPromotionService: PreviewPromotionUseCase,
    private readonly generateRecommendationService: GeneratePromotionRecommendationUseCase,
    private readonly activateSemesterService: ActivateSemesterUseCase,
    private readonly deactivateSemesterService: DeactivateSemesterUseCase,
  ) {}

  @Get()
  @RequirePermissions('semesters.read')
  @ApiOperation({ summary: 'List all semesters (paginated, filterable)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of semesters',
    type: SemesterListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SemesterQueryDto,
  ): Promise<{
    data: SemesterWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getSemestersService.execute(query);
  }

  @Post('rollover')
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary:
      'Rollover semester data (classrooms, enrollments, etc.) from source to target semester',
  })
  @ApiResponse({
    status: 200,
    description: 'Rollover summary with created/skipped counts',
  })
  @ApiResponse({ status: 400, description: 'Source and target must differ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async rollover(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RolloverSemesterDto,
  ): Promise<RolloverSummaryDto> {
    return this.rolloverSemesterService.execute(dto);
  }

  @Post('promote/recommend')
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
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateRecommendationDto,
  ): Promise<PromotionRecommendationDto> {
    return this.generateRecommendationService.execute(dto);
  }

  @Post('promote/preview')
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
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PromotionDto,
  ): Promise<PromotionPreviewDto> {
    return this.previewPromotionService.execute(dto);
  }

  @Post('promote')
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary:
      'Execute batch student promotion across academic years (PROMOTE/REPEAT/GRADUATE)',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion result with counts',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester or class not found' })
  async promote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PromotionDto,
  ): Promise<PromotionResultDto> {
    return this.promoteStudentsService.execute(dto);
  }

  @Get(':id')
  @RequirePermissions('semesters.read')
  @ApiOperation({ summary: 'Get a semester by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Semester details',
    type: SemesterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SemesterWithDetails> {
    return this.getSemesterByIdService.execute(id);
  }

  @Patch(':id/activate')
  @RequirePermissions('semesters.update')
  @ApiOperation({ summary: 'Activate a semester (deactivates all others)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Semester activated',
    type: SemesterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Academic year not active' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SemesterWithDetails> {
    return this.activateSemesterService.execute(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('semesters.update')
  @ApiOperation({ summary: 'Deactivate a semester' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Semester deactivated',
    type: SemesterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SemesterWithDetails> {
    return this.deactivateSemesterService.execute(id);
  }

  @Post()
  @RequirePermissions('semesters.create')
  @ApiOperation({ summary: 'Create a new semester' })
  @ApiResponse({
    status: 201,
    description: 'Semester created',
    type: SemesterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Academic year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Semester type already exists for this academic year',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSemesterDto,
  ): Promise<SemesterWithDetails> {
    return this.createSemesterService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('semesters.update')
  @ApiOperation({ summary: 'Update a semester' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Semester updated',
    type: SemesterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSemesterDto,
  ): Promise<SemesterWithDetails> {
    return this.updateSemesterService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('semesters.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a semester' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Semester deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteSemesterService.execute(id);
  }
}
