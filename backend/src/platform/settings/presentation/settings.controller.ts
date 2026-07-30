import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppKey } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../../../core/decorators/public.decorator.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { AppSettingResponseDto } from '../dto/response/app-setting-response.dto.js';
import { UpdateAppSettingDto } from '../dto/request/update-app-setting.dto.js';
import { GetAppSettingUseCase } from '../use-cases/get-app-setting.use-case.js';
import { UpdateAppSettingUseCase } from '../use-cases/update-app-setting.use-case.js';
import { UploadAppSettingLogoUseCase } from '../use-cases/upload-app-setting-logo.use-case.js';
import { UploadAppSettingFaviconUseCase } from '../use-cases/upload-app-setting-favicon.use-case.js';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly getUseCase: GetAppSettingUseCase,
    private readonly updateUseCase: UpdateAppSettingUseCase,
    private readonly uploadLogoUseCase: UploadAppSettingLogoUseCase,
    private readonly uploadFaviconUseCase: UploadAppSettingFaviconUseCase,
  ) {}

  @Get(':appKey')
  @Public()
  @ApiParam({ name: 'appKey', enum: AppKey })
  @ApiOperation({ summary: 'Get app settings (public — needed pre-login)' })
  @ApiResponse({ status: 200, type: AppSettingResponseDto })
  async get(@Param('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey) {
    return this.getUseCase.execute(appKey);
  }

  @Patch(':appKey')
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @ApiParam({ name: 'appKey', enum: AppKey })
  @ApiOperation({ summary: 'Update app settings' })
  @ApiResponse({ status: 200, type: AppSettingResponseDto })
  async update(
    @Param('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey,
    @Body() dto: UpdateAppSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateUseCase.execute(appKey, dto, user.id);
  }

  @Post(':appKey/logo')
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'appKey', enum: AppKey })
  @ApiOperation({ summary: 'Upload app logo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: AppSettingResponseDto })
  async uploadLogo(
    @Param('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadLogoUseCase.execute(appKey, file, user.id);
  }

  @Post(':appKey/favicon')
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'appKey', enum: AppKey })
  @ApiOperation({ summary: 'Upload app favicon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: AppSettingResponseDto })
  async uploadFavicon(
    @Param('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.uploadFaviconUseCase.execute(appKey, file, user.id);
  }
}
