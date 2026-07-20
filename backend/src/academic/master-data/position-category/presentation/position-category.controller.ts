import { RequirePermissions } from '../../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../../../platform/auth/index.js';

import { PositionCategoryQueryDto } from '../dto/request/position-category-query.dto.js';
import {
  PositionCategoryListResponseDto,
  PositionCategoryResponseDto,
} from '../dto/response/position-category-response.dto.js';
import {
  CreatePositionCategoryDto,
  UpdatePositionCategoryDto,
} from '../dto/request/create-position-category.dto.js';

import { CreatePositionCategoryUseCase } from '../use-cases/create-position-category.use-case.js';
import { GetPositionCategoriesUseCase } from '../use-cases/get-position-categories.use-case.js';
import { GetPositionCategoryByIdUseCase } from '../use-cases/get-position-category-by-id.use-case.js';
import { UpdatePositionCategoryUseCase } from '../use-cases/update-position-category.use-case.js';
import { DeletePositionCategoryUseCase } from '../use-cases/delete-position-category.use-case.js';

@ApiTags('Position Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('position-categories')
export class PositionCategoryController {
  constructor(
    private readonly createUseCase: CreatePositionCategoryUseCase,
    private readonly listUseCase: GetPositionCategoriesUseCase,
    private readonly getByIdUseCase: GetPositionCategoryByIdUseCase,
    private readonly updateUseCase: UpdatePositionCategoryUseCase,
    private readonly deleteUseCase: DeletePositionCategoryUseCase,
  ) {}

  @Get()
  @RequirePermissions('positions.read')
  @ApiOperation({ summary: 'List all position categories' })
  @ApiResponse({ status: 200, type: PositionCategoryListResponseDto })
  async findAll(@Query() query: PositionCategoryQueryDto) {
    return this.listUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('positions.read')
  @ApiOperation({ summary: 'Get position category by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: PositionCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Position category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('positions.create')
  @ApiOperation({ summary: 'Create a new position category' })
  @ApiResponse({ status: 201, type: PositionCategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  async create(@Body() dto: CreatePositionCategoryDto) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('positions.update')
  @ApiOperation({ summary: 'Update a position category' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: PositionCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Position category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionCategoryDto,
  ) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('positions.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a position category' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 409, description: 'Still in use' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
  }
}
