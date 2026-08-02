import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppKey } from '../../settings/domain/entities/app-setting.entity.js';
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

import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../auth/index.js';

import { ProfileResponseDto } from '../dto/response/profile-response.dto.js';
import { UpdateProfileDto } from '../dto/request/update-profile.dto.js';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case.js';
import { UploadProfilePhotoUseCase } from '../use-cases/upload-profile-photo.use-case.js';
import { DeleteProfilePhotoUseCase } from '../use-cases/delete-profile-photo.use-case.js';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly uploadProfilePhotoUseCase: UploadProfilePhotoUseCase,
    private readonly deleteProfilePhotoUseCase: DeleteProfilePhotoUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: "Get current user's profile with all relations" })
  @ApiResponse({ status: 200 })
  async getOwnProfile(@CurrentUser('id') userId: string) {
    return this.getProfileUseCase.execute(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update current user's profile" })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate NIK / email / phone' })
  async updateOwnProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(userId, dto);
  }

  @Post('me/photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'appKey', enum: AppKey })
  @ApiOperation({ summary: "Upload current user's profile photo" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async uploadOwnPhoto(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('appKey', new ParseEnumPipe(AppKey)) appKey: AppKey,
  ) {
    return this.uploadProfilePhotoUseCase.execute(userId, appKey, file);
  }

  @Delete('me/photo')
  @ApiOperation({ summary: "Delete current user's profile photo" })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async deleteOwnPhoto(@CurrentUser('id') userId: string) {
    return this.deleteProfilePhotoUseCase.execute(userId);
  }

  @Get(':userId')
  @RequirePermissions('profiles.read')
  @ApiOperation({
    summary: "Get any user's profile with all relations (Admin only)",
  })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findOneByAdmin(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.getProfileUseCase.execute(userId);
  }

  @Patch(':userId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update any user's profile (Admin only)" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate NIK / email / phone' })
  async updateByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(userId, dto);
  }
}
