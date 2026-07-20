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

import { StudentParentQueryDto } from '../dto/request/student-parent-query.dto.js';
import { CreateStudentParentDto } from '../dto/request/create-student-parent.dto.js';
import { UpdateStudentParentDto } from '../dto/request/update-student-parent.dto.js';
import {
  StudentParentListResponseDto,
  StudentParentResponseDto,
} from '../dto/response/student-parent-response.dto.js';
import { CreateStudentParentUseCase } from '../use-cases/create-student-parent.use-case.js';
import { DeleteStudentParentUseCase } from '../use-cases/delete-student-parent.use-case.js';
import { GetStudentParentByIdUseCase } from '../use-cases/get-student-parent-by-id.use-case.js';
import { GetStudentParentsListUseCase } from '../use-cases/get-student-parents-list.use-case.js';
import { UpdateStudentParentUseCase } from '../use-cases/update-student-parent.use-case.js';
import { StudentParentWithDetails } from '../domain/interfaces/student-parent-repository.interface.js';

@ApiTags('Student Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-parents')
export class StudentParentController {
  constructor(
    private readonly getStudentParentsListService: GetStudentParentsListUseCase,
    private readonly getStudentParentByIdService: GetStudentParentByIdUseCase,
    private readonly createStudentParentService: CreateStudentParentUseCase,
    private readonly updateStudentParentService: UpdateStudentParentUseCase,
    private readonly deleteStudentParentService: DeleteStudentParentUseCase,
  ) {}

  @Get()
  @RequirePermissions('students.read')
  @ApiOperation({
    summary: 'List all student-parent links (paginated, searchable)',
  })
  @ApiResponse({ status: 200, type: StudentParentListResponseDto })
  async findAll(@Query() query: StudentParentQueryDto): Promise<{
    data: StudentParentWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getStudentParentsListService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'Get a student-parent link by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentParentResponseDto })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentParentWithDetails> {
    return this.getStudentParentByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Create a student-parent link' })
  @ApiResponse({ status: 201, type: StudentParentResponseDto })
  @ApiResponse({ status: 404, description: 'Student or parent not found' })
  @ApiResponse({ status: 409, description: 'Link already exists' })
  async create(
    @Body() dto: CreateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    return this.createStudentParentService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('students.update')
  @ApiOperation({
    summary: 'Update a student-parent link (relation/isPrimary)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentParentResponseDto })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    return this.updateStudentParentService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('students.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student-parent link' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Link deleted' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteStudentParentService.execute(id);
  }
}
