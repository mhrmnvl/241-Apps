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

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { BulkImportTeachersResponseDto } from '../dto/response/bulk-import-teacher-response.dto.js';
import { ExportTeacherQueryDto } from '../dto/request/export-teacher-query.dto.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { BulkImportTeachersUseCase } from '../use-cases/bulk-import-teacher.use-case.js';
import { ResolveBulkImportConflictsUseCase } from '../use-cases/resolve-bulk-import-conflicts.use-case.js';
import { ExportTeachersUseCase } from '../use-cases/export-teacher.use-case.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeacherImportExportController {
  constructor(
    private readonly bulkImportTeachersUseCase: BulkImportTeachersUseCase,
    private readonly resolveBulkImportConflictsUseCase: ResolveBulkImportConflictsUseCase,
    private readonly exportTeachersUseCase: ExportTeachersUseCase,
  ) {}

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
  async export(@Query() query: ExportTeacherQueryDto): Promise<StreamableFile> {
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
  ): Promise<BulkImportTeachersResponseDto> {
    return this.bulkImportTeachersUseCase.execute(file.buffer);
  }

  @Post('bulk-import/resolve')
  @RequirePermissions('teachers.update')
  @ApiOperation({
    summary:
      'Resolve CONFLICT rows from a bulk import: update the matching ' +
      'teacher or skip it',
  })
  @ApiResponse({ status: 201, type: ResolveBulkImportResponseDto })
  async resolveBulkImportConflicts(
    @Body() dto: ResolveBulkImportConflictsDto,
  ): Promise<ResolveBulkImportResponseDto> {
    return this.resolveBulkImportConflictsUseCase.execute(dto);
  }
}
