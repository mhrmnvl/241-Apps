import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
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
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AcademicYearEntity as AcademicYear } from '../domain/entities/academic-year.entity.js';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { AcademicYearQueryDto } from '../dto/request/academic-year-query.dto.js';
import {
  AcademicYearListResponseDto,
  AcademicYearResponseDto,
} from '../dto/response/academic-year-response.dto.js';
import { CreateAcademicYearDto } from '../dto/request/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../dto/request/update-academic-year.dto.js';
import { ActivateAcademicYearUseCase } from '../use-cases/activate-academic-year.use-case.js';
import { CreateAcademicYearUseCase } from '../use-cases/create-academic-year.use-case.js';
import { DeactivateAcademicYearUseCase } from '../use-cases/deactivate-academic-year.use-case.js';
import { DeleteAcademicYearUseCase } from '../use-cases/delete-academic-year.use-case.js';
import { GetAcademicYearByIdUseCase } from '../use-cases/get-academic-year-by-id.use-case.js';
import { GetAcademicYearsUseCase } from '../use-cases/get-academic-years.use-case.js';
import { UpdateAcademicYearUseCase } from '../use-cases/update-academic-year.use-case.js';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('academic-years')
export class AcademicYearController {
  constructor(
    private readonly getAcademicYearsService: GetAcademicYearsUseCase,
    private readonly getAcademicYearByIdService: GetAcademicYearByIdUseCase,
    private readonly createAcademicYearService: CreateAcademicYearUseCase,
    private readonly updateAcademicYearService: UpdateAcademicYearUseCase,
    private readonly deleteAcademicYearService: DeleteAcademicYearUseCase,
    private readonly activateAcademicYearService: ActivateAcademicYearUseCase,
    private readonly deactivateAcademicYearService: DeactivateAcademicYearUseCase,
  ) {}

  @Get()
  @RequirePermissions('academic-years.read')
  @ApiOperation({ summary: 'List all academic years (paginated, searchable)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of academic years',
    type: AcademicYearListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AcademicYearQueryDto,
  ): Promise<{
    data: AcademicYear[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getAcademicYearsService.execute(query);
  }

  @Patch(':id/activate')
  @RequirePermissions('academic-years.update')
  @ApiOperation({
    summary: 'Activate an academic year (deactivates all others)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Academic year activated',
    type: AcademicYearResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicYear> {
    return this.activateAcademicYearService.execute(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('academic-years.update')
  @ApiOperation({ summary: 'Deactivate an academic year' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Academic year deactivated',
    type: AcademicYearResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicYear> {
    return this.deactivateAcademicYearService.execute(id);
  }

  @Get(':id')
  @RequirePermissions('academic-years.read')
  @ApiOperation({ summary: 'Get an academic year by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Academic year details',
    type: AcademicYearResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicYear> {
    return this.getAcademicYearByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('academic-years.create')
  @ApiOperation({ summary: 'Create a new academic year' })
  @ApiResponse({
    status: 201,
    description: 'Academic year created',
    type: AcademicYearResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Academic year name already exists',
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAcademicYearDto,
  ): Promise<AcademicYear> {
    return this.createAcademicYearService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('academic-years.update')
  @ApiOperation({ summary: 'Update an academic year' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Academic year updated',
    type: AcademicYearResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Academic year name already exists',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicYearDto,
  ): Promise<AcademicYear> {
    return this.updateAcademicYearService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('academic-years.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an academic year' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Academic year deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteAcademicYearService.execute(id);
  }
}
