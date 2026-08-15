import type { UserEntity } from '../../../shared/domain/entities/user.entity.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import type { RequestUser } from '../../../core/types/request-user.type.js';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentQueryDto } from '../dto/request/student-query.dto.js';
import {
  StudentListResponseDto,
  StudentResponseDto,
} from '../dto/response/student-response.dto.js';
import { UpdateStudentDto } from '../dto/request/update-student.dto.js';
import { CreateStudentUseCase } from '../use-cases/create-student.use-case.js';
import { CreateStudentWithRelationsUseCase } from '../use-cases/create-student-with-relations.use-case.js';
import { DeleteStudentUseCase } from '../use-cases/delete-student.use-case.js';
import { GetStudentByIdUseCase } from '../use-cases/get-student-by-id.use-case.js';
import { GetStudentsUseCase } from '../use-cases/get-students.use-case.js';
import { ToggleStudentActiveUseCase } from '../use-cases/toggle-student-active.use-case.js';
import { UpdateStudentUseCase } from '../use-cases/update-student.use-case.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';
import { CreateStudentWithRelationsDto } from '../dto/request/create-student-with-relations.dto.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly getStudentsService: GetStudentsUseCase,
    private readonly getStudentByIdService: GetStudentByIdUseCase,
    private readonly createStudentService: CreateStudentUseCase,
    private readonly createStudentWithRelationsService: CreateStudentWithRelationsUseCase,
    private readonly updateStudentService: UpdateStudentUseCase,
    private readonly deleteStudentService: DeleteStudentUseCase,
    private readonly toggleStudentActiveService: ToggleStudentActiveUseCase,
  ) {}

  /**
   * The roster: every student, for whoever holds `students.read`.
   *
   * The caller is deliberately not a parameter here, and that is the point of
   * the permission. This route answers about the school, not about the person
   * asking, so it is not narrowed for anyone — it is simply not granted to
   * them.
   *
   * This used to claim that a student reaches their own record through
   * `GET :id` below, "which does check who is asking". It does not: `:id`
   * requires `students.read` and takes no caller, so `students.read-own` is
   * granted to the student role and guards nothing at all. No screen asks for
   * it either — the student menu gates on the four `-own` codes for schedule,
   * attendance, scores and rapor. Either a `GET me` route should exist or the
   * permission should not; what must not stand is a sentence telling the next
   * reader the check is already there.
   *
   * It used to take `@CurrentUser() _user` and ignore it, while the student
   * role held `students.read`. The underscore recorded that ignoring it was
   * deliberate; what it did in practice was hand a student the whole roster.
   */
  @Get()
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'List all students (paginated, searchable)' })
  @ApiResponse({ status: 200, type: StudentListResponseDto })
  async findAll(
    @Query() query: StudentQueryDto,
  ): Promise<PaginatedResponse<StudentWithDetails>> {
    return this.getStudentsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StudentWithDetails> {
    const reqUser: RequestUser = { id: user.id };
    return this.getStudentByIdService.execute(id, reqUser);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Create a new student (User + Profile + Student)' })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Active semester not found' })
  @ApiResponse({ status: 409, description: 'Duplicate NIS or NISN' })
  async create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.createStudentService.execute(dto);
  }

  @Post('with-relations')
  @RequirePermissions('students.create')
  @ApiOperation({
    summary:
      'Create a student with address and parents atomically (single transaction)',
  })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Duplicate NIS, NISN, or parent NIK',
  })
  async createWithRelations(
    @Body() dto: CreateStudentWithRelationsDto,
  ): Promise<StudentWithDetails> {
    return this.createStudentWithRelationsService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Update student master data (NIS, NISN, status)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Duplicate NIS or NISN' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentWithDetails> {
    return this.updateStudentService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('students.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a student (also deactivates User)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Student deleted' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteStudentService.execute(id);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('students.update')
  @ApiOperation({
    summary: 'Activate or deactivate a student account (without deleting)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Account status updated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', new ParseBoolPipe()) isActive: boolean,
  ): Promise<UserEntity> {
    return this.toggleStudentActiveService.execute(id, isActive);
  }
}
