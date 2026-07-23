import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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

import { AchievementTypeQueryDto } from '../dto/request/achievement-type-query.dto.js';
import {
  AchievementTypesListResponseDto,
  AchievementTypeResponseDto,
} from '../dto/response/achievement-type-response.dto.js';
import { CreateAchievementTypeDto } from '../dto/request/create-achievement-type.dto.js';
import { UpdateAchievementTypeDto } from '../dto/request/update-achievement-type.dto.js';
import { CreateAchievementTypeUseCase } from '../use-cases/create-achievement-type.use-case.js';
import { DeleteAchievementTypeUseCase } from '../use-cases/delete-achievement-type.use-case.js';
import { GetAchievementTypeByIdUseCase } from '../use-cases/get-achievement-type-by-id.use-case.js';
import { GetAchievementTypesUseCase } from '../use-cases/get-achievement-types.use-case.js';
import { UpdateAchievementTypeUseCase } from '../use-cases/update-achievement-type.use-case.js';

@ApiTags('Achievement Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievement-types')
export class AchievementTypeController {
  constructor(
    private readonly getAchievementTypesService: GetAchievementTypesUseCase,
    private readonly getAchievementTypeByIdService: GetAchievementTypeByIdUseCase,
    private readonly createAchievementTypeService: CreateAchievementTypeUseCase,
    private readonly updateAchievementTypeService: UpdateAchievementTypeUseCase,
    private readonly deleteAchievementTypeService: DeleteAchievementTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('achievement-types.read')
  @ApiOperation({
    summary: 'List all achievement-types (paginated, filterable)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of achievement-types',
    type: AchievementTypesListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: AchievementTypeQueryDto) {
    return this.getAchievementTypesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('achievement-types.read')
  @ApiOperation({ summary: 'Get a achievement-type by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'AchievementType details',
    type: AchievementTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AchievementType not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAchievementTypeByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('achievement-types.create')
  @ApiOperation({ summary: 'Create a new achievement-type' })
  @ApiResponse({
    status: 201,
    description: 'AchievementType created',
    type: AchievementTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'AchievementType name already exists',
  })
  async create(@Body() dto: CreateAchievementTypeDto) {
    return this.createAchievementTypeService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('achievement-types.update')
  @ApiOperation({ summary: 'Update a achievement-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'AchievementType updated',
    type: AchievementTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AchievementType not found' })
  @ApiResponse({
    status: 409,
    description: 'AchievementType name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAchievementTypeDto,
  ) {
    return this.updateAchievementTypeService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('achievement-types.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a achievement-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'AchievementType deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AchievementType not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAchievementTypeService.execute(id);
  }
}
