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

import { AcademicCalendarTypeQueryDto } from '../dto/request/academic-calendar-type-query.dto.js';
import {
  AcademicCalendarTypesListResponseDto,
  AcademicCalendarTypeResponseDto,
} from '../dto/response/academic-calendar-type-response.dto.js';
import { CreateAcademicCalendarTypeDto } from '../dto/request/create-academic-calendar-type.dto.js';
import { UpdateAcademicCalendarTypeDto } from '../dto/request/update-academic-calendar-type.dto.js';
import { CreateAcademicCalendarTypeUseCase } from '../use-cases/create-academic-calendar-type.use-case.js';
import { DeleteAcademicCalendarTypeUseCase } from '../use-cases/delete-academic-calendar-type.use-case.js';
import { GetAcademicCalendarTypeByIdUseCase } from '../use-cases/get-academic-calendar-type-by-id.use-case.js';
import { GetAcademicCalendarTypesUseCase } from '../use-cases/get-academic-calendar-types.use-case.js';
import { UpdateAcademicCalendarTypeUseCase } from '../use-cases/update-academic-calendar-type.use-case.js';

@ApiTags('Academic Calendar Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('academic-calendar-types')
export class AcademicCalendarTypeController {
  constructor(
    private readonly getAcademicCalendarTypesService: GetAcademicCalendarTypesUseCase,
    private readonly getAcademicCalendarTypeByIdService: GetAcademicCalendarTypeByIdUseCase,
    private readonly createAcademicCalendarTypeService: CreateAcademicCalendarTypeUseCase,
    private readonly updateAcademicCalendarTypeService: UpdateAcademicCalendarTypeUseCase,
    private readonly deleteAcademicCalendarTypeService: DeleteAcademicCalendarTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('academic-calendar-types.read')
  @ApiOperation({
    summary: 'List all academic-calendar-types (paginated, filterable)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of academic-calendar-types',
    type: AcademicCalendarTypesListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: AcademicCalendarTypeQueryDto) {
    return this.getAcademicCalendarTypesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('academic-calendar-types.read')
  @ApiOperation({ summary: 'Get a academic-calendar-type by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'AcademicCalendarType details',
    type: AcademicCalendarTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AcademicCalendarType not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAcademicCalendarTypeByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('academic-calendar-types.create')
  @ApiOperation({ summary: 'Create a new academic-calendar-type' })
  @ApiResponse({
    status: 201,
    description: 'AcademicCalendarType created',
    type: AcademicCalendarTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'AcademicCalendarType name already exists',
  })
  async create(@Body() dto: CreateAcademicCalendarTypeDto) {
    return this.createAcademicCalendarTypeService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('academic-calendar-types.update')
  @ApiOperation({ summary: 'Update a academic-calendar-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'AcademicCalendarType updated',
    type: AcademicCalendarTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AcademicCalendarType not found' })
  @ApiResponse({
    status: 409,
    description: 'AcademicCalendarType name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicCalendarTypeDto,
  ) {
    return this.updateAcademicCalendarTypeService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('academic-calendar-types.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a academic-calendar-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'AcademicCalendarType deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'AcademicCalendarType not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAcademicCalendarTypeService.execute(id);
  }
}
