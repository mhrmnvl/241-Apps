import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppKey } from '../repositories/file.repository.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { FileResponseDto } from '../dto/response/file-response.dto.js';
import { UploadFileUseCase } from '../use-cases/upload-file.use-case.js';
import { GetFilesUseCase } from '../use-cases/get-files.use-case.js';
import { DeleteFileUseCase } from '../use-cases/delete-file.use-case.js';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(
    private readonly uploadUseCase: UploadFileUseCase,
    private readonly getManyUseCase: GetFilesUseCase,
    private readonly deleteUseCase: DeleteFileUseCase,
  ) {}

  @Post('upload')
  @RequirePermissions('files.create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['file'],
    },
  })
  @ApiQuery({ name: 'appKey', enum: AppKey })
  @ApiResponse({ status: 201, type: FileResponseDto })
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.uploadUseCase.execute(file, appKey, categoryId, user.id);
  }

  @Get()
  @RequirePermissions('files.read')
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, type: [FileResponseDto] })
  async findAll() {
    return this.getManyUseCase.execute();
  }

  @Delete(':id')
  @RequirePermissions('files.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
  }
}
