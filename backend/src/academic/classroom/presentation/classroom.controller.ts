import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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
import { CreateClassroomDto } from '../dto/request/create-classroom.dto.js';
import { ClassroomQueryDto } from '../dto/request/classroom-query.dto.js';
import {
  ClassroomListResponseDto,
  ClassroomResponseDto,
} from '../dto/response/classroom-response.dto.js';
import { ClassroomWithDetails } from '../domain/interfaces/classroom-repository.interface.js';
import { UpdateClassroomDto } from '../dto/request/update-classroom.dto.js';
import { CreateClassroomUseCase } from '../use-cases/create-classroom.use-case.js';
import { DeleteClassroomUseCase } from '../use-cases/delete-classroom.use-case.js';
import { GetClassroomByIdUseCase } from '../use-cases/get-classroom-by-id.use-case.js';
import { GetClassroomsUseCase } from '../use-cases/get-classrooms.use-case.js';
import { UpdateClassroomUseCase } from '../use-cases/update-classroom.use-case.js';

@ApiTags('Classrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(
    private readonly getClassroomsService: GetClassroomsUseCase,
    private readonly getClassroomByIdService: GetClassroomByIdUseCase,
    private readonly createClassroomService: CreateClassroomUseCase,
    private readonly updateClassroomService: UpdateClassroomUseCase,
    private readonly deleteClassroomService: DeleteClassroomUseCase,
  ) {}

  @Get()
  @RequirePermissions('classrooms.read')
  @ApiOperation({ summary: 'List all classrooms (paginated, searchable)' })
  @ApiResponse({ status: 200, type: ClassroomListResponseDto })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ClassroomQueryDto,
  ): Promise<{
    data: ClassroomWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getClassroomsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('classrooms.read')
  @ApiOperation({ summary: 'Get a classroom by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClassroomResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassroomWithDetails> {
    return this.getClassroomByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('classrooms.create')
  @ApiOperation({ summary: 'Create a new classroom' })
  @ApiResponse({ status: 201, type: ClassroomResponseDto })
  @ApiResponse({ status: 409, description: 'Classroom code already exists' })
  async create(
    @Body() dto: CreateClassroomDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClassroomWithDetails> {
    return this.createClassroomService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('classrooms.update')
  @ApiOperation({ summary: 'Update classroom' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClassroomResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  @ApiResponse({ status: 409, description: 'Classroom code already exists' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassroomDto,
  ): Promise<ClassroomWithDetails> {
    return this.updateClassroomService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('classrooms.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a classroom' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Classroom deleted' })
  @ApiResponse({ status: 404, description: 'Classroom not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteClassroomService.execute(id);
  }
}
