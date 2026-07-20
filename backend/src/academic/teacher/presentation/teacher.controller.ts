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
import type { User, Profile } from '@prisma/client';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { BulkImportTeachersResponseDto } from '../dto/response/bulk-import-teacher-response.dto.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { TeacherQueryDto } from '../dto/request/teacher-query.dto.js';
import {
  TeacherListResponseDto,
  TeacherResponseDto,
} from '../dto/response/teacher-response.dto.js';
import { ExportTeacherQueryDto } from '../dto/request/export-teacher-query.dto.js';
import { UpdateTeacherDto } from '../dto/request/update-teacher.dto.js';
import { BulkImportTeachersUseCase } from '../use-cases/bulk-import-teacher.use-case.js';
import { CreateTeacherUseCase } from '../use-cases/create-teacher.use-case.js';
import { DeleteTeacherUseCase } from '../use-cases/delete-teacher.use-case.js';
import { ExportTeachersUseCase } from '../use-cases/export-teacher.use-case.js';
import { GetTeacherByIdUseCase } from '../use-cases/get-teacher-by-id.use-case.js';
import { GetTeachersUseCase } from '../use-cases/get-teachers.use-case.js';
import { ToggleTeacherActiveUseCase } from '../use-cases/toggle-teacher-active.use-case.js';
import { UpdateTeacherProfileUseCase } from '../use-cases/update-teacher-profile.use-case.js';
import { UpdateTeacherUseCase } from '../use-cases/update-teacher.use-case.js';
import type {
  TeacherWithDetails,
  TeacherListWithDetails,
} from '../domain/interfaces/teacher-repository.interface.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeacherController {
  constructor(
    private readonly getTeachersUseCase: GetTeachersUseCase,
    private readonly getTeacherByIdUseCase: GetTeacherByIdUseCase,
    private readonly createTeacherUseCase: CreateTeacherUseCase,
    private readonly updateTeacherUseCase: UpdateTeacherUseCase,
    private readonly deleteTeacherUseCase: DeleteTeacherUseCase,
    private readonly toggleTeacherActiveUseCase: ToggleTeacherActiveUseCase,
    private readonly updateProfileUseCase: UpdateTeacherProfileUseCase,
    private readonly bulkImportTeachersUseCase: BulkImportTeachersUseCase,
    private readonly exportTeachersUseCase: ExportTeachersUseCase,
  ) {}

  @Get()
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: 'List all teachers (paginated, searchable)' })
  @ApiResponse({ status: 200, type: TeacherListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TeacherQueryDto,
  ): Promise<{
    data: TeacherListWithDetails[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.getTeachersUseCase.execute(query);
  }

  @Get('export')
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: 'Export teachers to Excel (.xlsx)' })
  @ApiResponse({
    status: 200,
    description: 'Returns an Excel file as attachment',
    headers: {
      'Content-Disposition': {
        description: 'attachment; filename="teachers.xlsx"',
        schema: { type: 'string' },
      },
    },
  })
  async export(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportTeacherQueryDto,
  ): Promise<StreamableFile> {
    const buffer = await this.exportTeachersUseCase.execute(query);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="teachers.xlsx"',
    });
  }

  @Get('import-template')
  @RequirePermissions('teachers.read')
  @ApiOperation({
    summary: 'Download blank import template (.xlsx) for teachers',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a blank Excel template file',
    headers: {
      'Content-Disposition': {
        description: 'attachment; filename="template_import_pegawai.xlsx"',
        schema: { type: 'string' },
      },
    },
  })
  async downloadImportTemplate(): Promise<StreamableFile> {
    const buffer = await this.exportTeachersUseCase.buildImportTemplate();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="template_import_pegawai.xlsx"',
    });
  }

  @Get(':id')
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: 'Get an teacher by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TeacherResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherWithDetails> {
    return this.getTeacherByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('teachers.create')
  @ApiOperation({
    summary: 'Create teacher (User + Profile in one transaction)',
  })
  @ApiResponse({ status: 201, type: TeacherResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate identifier / NIK / NIP / NUPTK',
  })
  async create(
    @Body() dto: CreateTeacherDto,
    @CurrentUser() creator: AuthenticatedUser,
  ): Promise<TeacherWithDetails> {
    return this.createTeacherUseCase.execute(dto);
  }

  @Post('bulk-import')
  @RequirePermissions('teachers.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk import teachers from Excel file (.xlsx)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: BulkImportTeachersResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or empty sheet' })
  async bulkImport(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @CurrentUser() creator: AuthenticatedUser,
  ): Promise<BulkImportTeachersResponseDto> {
    return this.bulkImportTeachersUseCase.execute(file.buffer);
  }

  @Patch(':id')
  @RequirePermissions('teachers.update')
  @ApiOperation({
    summary: 'Update teacher fields (NIP, NUPTK, employment status)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TeacherResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ): Promise<TeacherWithDetails> {
    return this.updateTeacherUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('teachers.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an teacher (also deactivates User)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Teacher deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteTeacherUseCase.execute(id);
  }

  @Patch(':id/profile')
  @RequirePermissions('teachers.update')
  @ApiOperation({ summary: "Update teacher's profile" })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TeacherResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 409, description: 'Duplicate NIK' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.updateProfileUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('teachers.update')
  @ApiOperation({
    summary: 'Activate or deactivate an teacher account (without deleting)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Account status updated' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async toggleActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', new ParseBoolPipe()) isActive: boolean,
  ): Promise<User> {
    return this.toggleTeacherActiveUseCase.execute(id, isActive);
  }
}
