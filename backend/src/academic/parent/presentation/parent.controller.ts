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

import { ParentQueryDto } from '../dto/parent-query.dto.js';
import { CreateParentDto } from '../dto/create-parent.dto.js';
import { UpdateParentDto } from '../dto/update-parent.dto.js';
import {
  ParentListResponseDto,
  ParentResponseDto,
} from '../dto/parent-response.dto.js';
import { CreateParentUseCase } from '../use-cases/create-parent.use-case.js';
import { DeleteParentUseCase } from '../use-cases/delete-parent.use-case.js';
import { GetParentByIdUseCase } from '../use-cases/get-parent-by-id.use-case.js';
import { GetParentsUseCase } from '../use-cases/get-parents.use-case.js';
import { UpdateParentUseCase } from '../use-cases/update-parent.use-case.js';

@ApiTags('Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parents')
export class ParentController {
  constructor(
    private readonly getParentsService: GetParentsUseCase,
    private readonly getParentByIdService: GetParentByIdUseCase,
    private readonly createParentService: CreateParentUseCase,
    private readonly updateParentService: UpdateParentUseCase,
    private readonly deleteParentService: DeleteParentUseCase,
  ) {}

  @Get()
  @RequirePermissions('parents.read')
  @ApiOperation({ summary: 'List all parents (paginated, filterable)' })
  @ApiResponse({ status: 200, type: ParentListResponseDto })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ParentQueryDto,
  ) {
    return this.getParentsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('parents.read')
  @ApiOperation({ summary: 'Get a parent by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ParentResponseDto })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getParentByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('parents.create')
  @ApiOperation({ summary: 'Create a new parent' })
  @ApiResponse({ status: 201, type: ParentResponseDto })
  @ApiResponse({ status: 404, description: 'Occupation not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate NIK / inactive occupation',
  })
  async create(@Body() dto: CreateParentDto) {
    return this.createParentService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('parents.update')
  @ApiOperation({ summary: 'Update a parent' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ParentResponseDto })
  @ApiResponse({ status: 404, description: 'Parent or occupation not found' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate NIK / inactive occupation',
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.updateParentService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('parents.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parent (soft delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Parent deleted' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteParentService.execute(id);
  }
}
