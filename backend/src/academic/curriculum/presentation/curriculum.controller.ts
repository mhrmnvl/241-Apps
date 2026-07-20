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

import { CurriculaQueryDto } from '../dto/request/curriculum-query.dto.js';
import {
  CurriculaListResponseDto,
  CurriculaResponseDto,
} from '../dto/response/curriculum-response.dto.js';
import { CreateCurriculaDto } from '../dto/request/create-curriculum.dto.js';
import { UpdateCurriculaDto } from '../dto/request/update-curriculum.dto.js';
import { CreateCurriculaUseCase } from '../use-cases/create-curriculum.use-case.js';
import { DeleteCurriculaUseCase } from '../use-cases/delete-curriculum.use-case.js';
import { GetCurriculaByIdUseCase } from '../use-cases/get-curricula-by-id.use-case.js';
import { GetCurriculaUseCase } from '../use-cases/get-curricula.use-case.js';
import { UpdateCurriculaUseCase } from '../use-cases/update-curriculum.use-case.js';

@ApiTags('Curricula')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('curricula')
export class CurriculumController {
  constructor(
    private readonly getCurriculaService: GetCurriculaUseCase,
    private readonly getCurriculaByIdService: GetCurriculaByIdUseCase,
    private readonly createCurriculaService: CreateCurriculaUseCase,
    private readonly updateCurriculaService: UpdateCurriculaUseCase,
    private readonly deleteCurriculaService: DeleteCurriculaUseCase,
  ) {}

  @Get()
  @RequirePermissions('curricula.read')
  @ApiOperation({ summary: 'List all curricula (paginated, searchable)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of curricula',
    type: CurriculaListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CurriculaQueryDto,
  ) {
    return this.getCurriculaService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('curricula.read')
  @ApiOperation({ summary: 'Get a curriculum by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Curriculum details',
    type: CurriculaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Curriculum not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getCurriculaByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('curricula.create')
  @ApiOperation({ summary: 'Create a new curriculum' })
  @ApiResponse({
    status: 201,
    description: 'Curriculum created',
    type: CurriculaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Academic year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Curriculum name already exists in this academic year',
  })
  async create(
    @Body() dto: CreateCurriculaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createCurriculaService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('curricula.update')
  @ApiOperation({ summary: 'Update a curriculum' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Curriculum updated',
    type: CurriculaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Curriculum or academic year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Curriculum name already exists in this academic year',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCurriculaDto,
  ) {
    return this.updateCurriculaService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('curricula.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a curriculum' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Curriculum deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Curriculum not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteCurriculaService.execute(id);
  }
}
