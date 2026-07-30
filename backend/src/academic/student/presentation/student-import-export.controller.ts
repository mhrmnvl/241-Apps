import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Get,
  ParseFilePipe,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import { BulkImportStudentsResponseDto } from '../dto/response/bulk-import-student-response.dto.js';
import { ExportStudentQueryDto } from '../dto/request/export-student-query.dto.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { BulkImportStudentsUseCase } from '../use-cases/bulk-import-student.use-case.js';
import { ResolveBulkImportConflictsUseCase } from '../use-cases/resolve-bulk-import-conflicts.use-case.js';
import { ExportStudentsUseCase } from '../use-cases/export-student.use-case.js';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentImportExportController {
  constructor(
    private readonly bulkImportStudentsService: BulkImportStudentsUseCase,
    private readonly resolveBulkImportConflictsService: ResolveBulkImportConflictsUseCase,
    private readonly exportStudentsService: ExportStudentsUseCase,
  ) {}

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
    @CurrentUser() _user: AuthenticatedUser,
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
    @CurrentUser() _creator: AuthenticatedUser,
  ): Promise<BulkImportStudentsResponseDto> {
    return this.bulkImportStudentsService.execute(file.buffer);
  }

  @Post('bulk-import/resolve')
  @RequirePermissions('students.update')
  @ApiOperation({
    summary:
      'Resolve CONFLICT rows from a bulk import: update the matching ' +
      'student or skip it',
  })
  @ApiResponse({ status: 201, type: ResolveBulkImportResponseDto })
  async resolveBulkImportConflicts(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: ResolveBulkImportConflictsDto,
  ): Promise<ResolveBulkImportResponseDto> {
    return this.resolveBulkImportConflictsService.execute(dto);
  }
}
