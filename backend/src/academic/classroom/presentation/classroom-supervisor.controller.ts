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

import { ClassroomSupervisorQueryDto } from '../dto/request/classroom-supervisor-query.dto.js';
import {
  ClassroomSupervisorListResponseDto,
  ClassroomSupervisorResponseDto,
} from '../dto/response/classroom-supervisor-response.dto.js';
import { CreateClassroomSupervisorDto } from '../dto/request/create-classroom-supervisor.dto.js';
import { UpdateClassroomSupervisorDto } from '../dto/request/update-classroom-supervisor.dto.js';
import { CreateClassroomSupervisorUseCase } from '../use-cases/create-classroom-supervisor.use-case.js';
import { DeleteClassroomSupervisorUseCase } from '../use-cases/delete-classroom-supervisor.use-case.js';
import { GetClassroomSupervisorByIdUseCase } from '../use-cases/get-classroom-supervisor-by-id.use-case.js';
import { GetClassroomSupervisorsUseCase } from '../use-cases/get-classroom-supervisors.use-case.js';
import { UpdateClassroomSupervisorUseCase } from '../use-cases/update-classroom-supervisor.use-case.js';
import { ClassroomSupervisorWithDetails } from '../domain/interfaces/classroom-supervisor-repository.interface.js';

@ApiTags('Classroom Supervisors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classroom-supervisors')
export class ClassroomSupervisorController {
  constructor(
    private readonly GetClassroomSupervisorsUseCase: GetClassroomSupervisorsUseCase,
    private readonly GetClassroomSupervisorByIdUseCase: GetClassroomSupervisorByIdUseCase,
    private readonly CreateClassroomSupervisorUseCase: CreateClassroomSupervisorUseCase,
    private readonly UpdateClassroomSupervisorUseCase: UpdateClassroomSupervisorUseCase,
    private readonly DeleteClassroomSupervisorUseCase: DeleteClassroomSupervisorUseCase,
  ) {}

  @Get()
  @RequirePermissions('classrooms.read')
  @ApiOperation({
    summary: 'List all class supervisors (wali kelas) per semester',
  })
  @ApiResponse({ status: 200, type: ClassroomSupervisorListResponseDto })
  async findAll(@Query() query: ClassroomSupervisorQueryDto): Promise<{
    data: ClassroomSupervisorWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.GetClassroomSupervisorsUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('classrooms.read')
  @ApiOperation({ summary: 'Get a classroom supervisor by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClassroomSupervisorResponseDto })
  @ApiResponse({ status: 404, description: 'ClassroomSupervisor not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.GetClassroomSupervisorByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('classrooms.create')
  @ApiOperation({
    summary: 'Assign a wali kelas to a classroom for a semester',
  })
  @ApiResponse({ status: 201, type: ClassroomSupervisorResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Class, teacher, or semester not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Class already has a supervisor for this semester',
  })
  async create(
    @Body() dto: CreateClassroomSupervisorDto,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.CreateClassroomSupervisorUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('classrooms.update')
  @ApiOperation({ summary: 'Update a classroom supervisor assignment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClassroomSupervisorResponseDto })
  @ApiResponse({
    status: 404,
    description: 'ClassSupervisor, class, teacher, or semester not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Class already has a supervisor for this semester',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassroomSupervisorDto,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.UpdateClassroomSupervisorUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('classrooms.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a classroom supervisor assignment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'ClassroomSupervisor deleted' })
  @ApiResponse({ status: 404, description: 'ClassroomSupervisor not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.DeleteClassroomSupervisorUseCase.execute(id);
  }
}
