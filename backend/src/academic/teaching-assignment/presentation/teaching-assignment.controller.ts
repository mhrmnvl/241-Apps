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
  BadRequestException,
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
import { CreateTeachingAssignmentDto } from '../dto/create-teaching-assignment.dto.js';
import { TeachingAssignmentQueryDto } from '../dto/teaching-assignment-query.dto.js';
import { UpdateTeachingAssignmentDto } from '../dto/update-teaching-assignment.dto.js';
import { GetTeachingAssignmentsUseCase } from '../use-cases/get-teaching-assignments.use-case.js';
import { GetTeachingAssignmentByIdUseCase } from '../use-cases/get-teaching-assignment-by-id.use-case.js';
import { CreateTeachingAssignmentUseCase } from '../use-cases/create-teaching-assignment.use-case.js';
import { UpdateTeachingAssignmentUseCase } from '../use-cases/update-teaching-assignment.use-case.js';
import { DeleteTeachingAssignmentUseCase } from '../use-cases/delete-teaching-assignment.use-case.js';

@ApiTags('Teaching Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teaching-assignments')
export class TeachingAssignmentController {
  constructor(
    private readonly getAll: GetTeachingAssignmentsUseCase,
    private readonly getById: GetTeachingAssignmentByIdUseCase,
    private readonly createUC: CreateTeachingAssignmentUseCase,
    private readonly updateUC: UpdateTeachingAssignmentUseCase,
    private readonly deleteUC: DeleteTeachingAssignmentUseCase,
  ) {}

  @Get()
  @RequirePermissions('teaching-assignments.read')
  @ApiOperation({ summary: 'List teaching assignments' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: TeachingAssignmentQueryDto,
  ) {
    return this.getAll.execute(q);
  }

  @Get(':id')
  @RequirePermissions('teaching-assignments.read')
  @ApiOperation({ summary: 'Get teaching assignment by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('teaching-assignments.create')
  @ApiOperation({ summary: 'Create teaching assignment' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTeachingAssignmentDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('teaching-assignments.update')
  @ApiOperation({ summary: 'Update teaching assignment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeachingAssignmentDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('teaching-assignments.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete teaching assignment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
