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

import { ClassroomStructureQueryDto } from '../dto/request/classroom-structure-query.dto.js';
import {
  ClassroomStructureListResponseDto,
  ClassroomStructureResponseDto,
} from '../dto/response/classroom-structure-response.dto.js';
import { CreateClassroomStructureDto } from '../dto/request/create-classroom-structure.dto.js';
import { UpdateClassroomStructureDto } from '../dto/request/update-classroom-structure.dto.js';
import { CreateClassroomStructureUseCase } from '../use-cases/create-classroom-structure.use-case.js';
import { DeleteClassroomStructureUseCase } from '../use-cases/delete-classroom-structure.use-case.js';
import { GetClassroomStructuresUseCase } from '../use-cases/get-classroom-structures.use-case.js';
import { UpdateClassroomStructureUseCase } from '../use-cases/update-classroom-structure.use-case.js';
import { ClassroomStructureWithDetails } from '../domain/interfaces/classroom-structure-repository.interface.js';

@ApiTags('Classroom Structures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classroom-structures')
export class ClassroomStructureController {
  constructor(
    private readonly GetClassroomStructuresUseCase: GetClassroomStructuresUseCase,
    private readonly CreateClassroomStructureUseCase: CreateClassroomStructureUseCase,
    private readonly UpdateClassroomStructureUseCase: UpdateClassroomStructureUseCase,
    private readonly DeleteClassroomStructureUseCase: DeleteClassroomStructureUseCase,
  ) {}

  @Get()
  @RequirePermissions('classrooms.read')
  @ApiOperation({
    summary: 'List class structures (officers per class/semester)',
  })
  @ApiResponse({ status: 200, type: ClassroomStructureListResponseDto })
  async findAll(@Query() query: ClassroomStructureQueryDto): Promise<{
    data: ClassroomStructureWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.GetClassroomStructuresUseCase.execute(query);
  }

  @Post()
  @RequirePermissions('classrooms.create')
  @ApiOperation({ summary: 'Create class structure (assign officers)' })
  @ApiResponse({ status: 201, type: ClassroomStructureResponseDto })
  @ApiResponse({ status: 400, description: 'Student not enrolled' })
  @ApiResponse({ status: 404, description: 'Class or semester not found' })
  @ApiResponse({
    status: 409,
    description: 'Structure already exists for this class/semester',
  })
  async create(
    @Body() dto: CreateClassroomStructureDto,
  ): Promise<ClassroomStructureWithDetails> {
    return this.CreateClassroomStructureUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('classrooms.update')
  @ApiOperation({
    summary: 'Update class structure (change officer assignments)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClassroomStructureResponseDto })
  @ApiResponse({ status: 400, description: 'Student not enrolled' })
  @ApiResponse({ status: 404, description: 'ClassroomStructure not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassroomStructureDto,
  ): Promise<ClassroomStructureWithDetails> {
    return this.UpdateClassroomStructureUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('classrooms.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a classroom structure' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'ClassroomStructure deleted' })
  @ApiResponse({ status: 404, description: 'ClassroomStructure not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.DeleteClassroomStructureUseCase.execute(id);
  }
}
