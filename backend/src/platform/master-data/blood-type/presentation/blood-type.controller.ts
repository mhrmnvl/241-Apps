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

import { BloodTypeQueryDto } from '../dto/request/blood-type-query.dto.js';
import {
  BloodTypesListResponseDto,
  BloodTypeResponseDto,
} from '../dto/response/blood-type-response.dto.js';
import { CreateBloodTypeDto } from '../dto/request/create-blood-type.dto.js';
import { UpdateBloodTypeDto } from '../dto/request/update-blood-type.dto.js';
import { CreateBloodTypeUseCase } from '../use-cases/create-blood-type.use-case.js';
import { DeleteBloodTypeUseCase } from '../use-cases/delete-blood-type.use-case.js';
import { GetBloodTypeByIdUseCase } from '../use-cases/get-blood-type-by-id.use-case.js';
import { GetBloodTypesUseCase } from '../use-cases/get-blood-types.use-case.js';
import { UpdateBloodTypeUseCase } from '../use-cases/update-blood-type.use-case.js';

@ApiTags('Blood Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blood-types')
export class BloodTypeController {
  constructor(
    private readonly getBloodTypesService: GetBloodTypesUseCase,
    private readonly getBloodTypeByIdService: GetBloodTypeByIdUseCase,
    private readonly createBloodTypeService: CreateBloodTypeUseCase,
    private readonly updateBloodTypeService: UpdateBloodTypeUseCase,
    private readonly deleteBloodTypeService: DeleteBloodTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('blood-types.read')
  @ApiOperation({
    summary: 'List all blood-types (paginated, filterable)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of blood-types',
    type: BloodTypesListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: BloodTypeQueryDto) {
    return this.getBloodTypesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('blood-types.read')
  @ApiOperation({ summary: 'Get a blood-type by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'BloodType details',
    type: BloodTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'BloodType not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getBloodTypeByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('blood-types.create')
  @ApiOperation({ summary: 'Create a new blood-type' })
  @ApiResponse({
    status: 201,
    description: 'BloodType created',
    type: BloodTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'BloodType name already exists' })
  async create(@Body() dto: CreateBloodTypeDto) {
    return this.createBloodTypeService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('blood-types.update')
  @ApiOperation({ summary: 'Update a blood-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'BloodType updated',
    type: BloodTypeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'BloodType not found' })
  @ApiResponse({ status: 409, description: 'BloodType name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBloodTypeDto,
  ) {
    return this.updateBloodTypeService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('blood-types.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a blood-type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'BloodType deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'BloodType not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteBloodTypeService.execute(id);
  }
}
