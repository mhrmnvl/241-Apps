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
import { CurrentUser } from '../../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../../core/types/authenticated-user.type.js';

import { EmploymentTypeQueryDto } from '../dto/request/employment-type-query.dto.js';
import {
  EmploymentTypeListResponseDto,
  EmploymentTypeResponseDto,
} from '../dto/response/employment-type-response.dto.js';
import { CreateEmploymentTypeDto } from '../dto/request/create-employment-type.dto.js';
import { UpdateEmploymentTypeDto } from '../dto/request/update-employment-type.dto.js';

import { CreateEmploymentTypeUseCase } from '../use-cases/create-employment-type.use-case.js';
import { GetEmploymentTypesUseCase } from '../use-cases/get-employment-types.use-case.js';
import { GetEmploymentTypeByIdUseCase } from '../use-cases/get-employment-type-by-id.use-case.js';
import { UpdateEmploymentTypeUseCase } from '../use-cases/update-employment-type.use-case.js';
import { DeleteEmploymentTypeUseCase } from '../use-cases/delete-employment-type.use-case.js';

@ApiTags('Employment Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employment-types')
export class EmploymentTypeController {
  constructor(
    private readonly createUseCase: CreateEmploymentTypeUseCase,
    private readonly listUseCase: GetEmploymentTypesUseCase,
    private readonly getByIdUseCase: GetEmploymentTypeByIdUseCase,
    private readonly updateUseCase: UpdateEmploymentTypeUseCase,
    private readonly deleteUseCase: DeleteEmploymentTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: 'List all employment types for the school unit' })
  @ApiResponse({ status: 200, type: EmploymentTypeListResponseDto })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: EmploymentTypeQueryDto,
  ) {
    return this.listUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: 'Get employment type by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: EmploymentTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Employment type not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('teachers.create')
  @ApiOperation({ summary: 'Create a new employment type' })
  @ApiResponse({ status: 201, type: EmploymentTypeResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmploymentTypeDto,
  ) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('teachers.update')
  @ApiOperation({ summary: 'Update an employment type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: EmploymentTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Employment type not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmploymentTypeDto,
  ) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('teachers.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an employment type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 409, description: 'Still in use' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUseCase.execute(id);
  }
}
