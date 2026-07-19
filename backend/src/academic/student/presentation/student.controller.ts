import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import type { RequestUser } from '../types/student.types.js';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import { BulkImportStudentsResponseDto } from '../dto/bulk-import-student-response.dto.js';
import { CreateStudentDto } from '../dto/create-student.dto.js';
import { ExportStudentQueryDto } from '../dto/export-student-query.dto.js';
import { StudentQueryDto } from '../dto/student-query.dto.js';
import {
  StudentListResponseDto,
  StudentResponseDto,
} from '../dto/student-response.dto.js';
import { UpdateStudentDto } from '../dto/update-student.dto.js';
import { BulkImportStudentsUseCase } from '../use-cases/bulk-import-student.use-case.js';
import { CreateStudentUseCase } from '../use-cases/create-student.use-case.js';
import { DeleteStudentUseCase } from '../use-cases/delete-student.use-case.js';
import { ExportStudentsUseCase } from '../use-cases/export-student.use-case.js';
import { GetStudentByIdUseCase } from '../use-cases/get-student-by-id.use-case.js';
import { GetStudentsUseCase } from '../use-cases/get-students.use-case.js';
import { ToggleStudentActiveUseCase } from '../use-cases/toggle-student-active.use-case.js';
import { UpdateStudentUseCase } from '../use-cases/update-student.use-case.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly getStudentsService: GetStudentsUseCase,
    private readonly getStudentByIdService: GetStudentByIdUseCase,
    private readonly createStudentService: CreateStudentUseCase,
    private readonly updateStudentService: UpdateStudentUseCase,
    private readonly deleteStudentService: DeleteStudentUseCase,
    private readonly toggleStudentActiveService: ToggleStudentActiveUseCase,
    private readonly bulkImportStudentsService: BulkImportStudentsUseCase,
    private readonly exportStudentsService: ExportStudentsUseCase,
  ) {}

  @Get()
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'List all students (paginated, searchable)' })
  @ApiResponse({ status: 200, type: StudentListResponseDto })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: StudentQueryDto,
  ): Promise<{
    data: StudentWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getStudentsService.execute(query);
  }

  @Get('export')
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'Export students to Excel (.xlsx)' })
  @ApiResponse({
    status: 200,
    description: 'Returns an Excel file as attachment',
    headers: {
      'Content-Disposition': {
        description: 'attachment; filename="students.xlsx"',
        schema: { type: 'string' },
      },
    },
  })
  async export(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportStudentQueryDto,
  ): Promise<StreamableFile> {
    const buffer = await this.exportStudentsService.execute(query);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="students.xlsx"',
    });
  }

  @Get('import-template')
  @RequirePermissions('students.read')
  @ApiOperation({
    summary: 'Download blank import template (.xlsx) for students',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a blank Excel template file',
    headers: {
      'Content-Disposition': {
        description: 'attachment; filename="template_import_siswa.xlsx"',
        schema: { type: 'string' },
      },
    },
  })
  async downloadImportTemplate(): Promise<StreamableFile> {
    const buffer = await this.exportStudentsService.buildImportTemplate();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="template_import_siswa.xlsx"',
    });
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
  async create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() creator: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.createStudentService.execute(dto);
  }

  @Post('bulk-import')
  @RequirePermissions('students.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk import students from Excel file (.xlsx)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: BulkImportStudentsResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or empty sheet' })
  async bulkImport(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() creator: AuthenticatedUser,
  ): Promise<BulkImportStudentsResponseDto> {
    return this.bulkImportStudentsService.execute(file.buffer);
  }

  @Patch(':id')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Update student master data (NIS, NISN, status)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Duplicate NIS or NISN' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
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
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
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
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', new ParseBoolPipe()) isActive: boolean,
  ): Promise<User> {
    return this.toggleStudentActiveService.execute(id, isActive);
  }
}
