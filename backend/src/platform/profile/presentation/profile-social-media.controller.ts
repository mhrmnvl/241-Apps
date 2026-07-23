import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../auth/index.js';

import { CreateProfileSocialMediaDto } from '../dto/request/create-profile-social-media.dto.js';
import { ProfileSocialMediaQueryDto } from '../dto/request/profile-social-media-query.dto.js';
import {
  ProfileSocialMediaListResponseDto,
  ProfileSocialMediaResponseDto,
} from '../dto/response/profile-social-media-response.dto.js';
import { UpdateProfileSocialMediaDto } from '../dto/request/update-profile-social-media.dto.js';
import { AddProfileSocialMediaUseCase } from '../use-cases/add-profile-social-media.use-case.js';
import { GetAllProfileSocialMediasUseCase } from '../use-cases/get-all-profile-social-medias.use-case.js';
import { GetProfileSocialMediasUseCase } from '../use-cases/get-profile-social-medias.use-case.js';
import { RemoveProfileSocialMediaUseCase } from '../use-cases/remove-profile-social-media.use-case.js';
import { UpdateProfileSocialMediaUseCase } from '../use-cases/update-profile-social-media.use-case.js';

@ApiTags('Profile Social Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfileSocialMediaController {
  constructor(
    private readonly getAllProfileSocialMediasUseCase: GetAllProfileSocialMediasUseCase,
    private readonly getProfileSocialMediasUseCase: GetProfileSocialMediasUseCase,
    private readonly addProfileSocialMediaUseCase: AddProfileSocialMediaUseCase,
    private readonly updateProfileSocialMediaUseCase: UpdateProfileSocialMediaUseCase,
    private readonly removeProfileSocialMediaUseCase: RemoveProfileSocialMediaUseCase,
  ) {}

  @Get()
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: 'List all social media links (paginated)' })
  @ApiResponse({ status: 200, type: ProfileSocialMediaListResponseDto })
  async getAllSocialMedias(@Query() query: ProfileSocialMediaQueryDto) {
    return this.getAllProfileSocialMediasUseCase.execute(query);
  }

  @Get('me')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "List current user's social media links" })
  @ApiResponse({ status: 200, type: [ProfileSocialMediaResponseDto] })
  async getOwnSocialMedias(@CurrentUser('id') userId: string) {
    return this.getProfileSocialMediasUseCase.execute(userId);
  }

  @Post('me')
  @RequirePermissions('profiles.create')
  @ApiOperation({ summary: "Add social media link to current user's profile" })
  @ApiResponse({ status: 201, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform already linked' })
  async addOwnSocialMedia(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProfileSocialMediaDto,
  ) {
    return this.addProfileSocialMediaUseCase.execute(userId, dto);
  }

  @Patch('me/:socialMediaId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update current user's social media link" })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async updateOwnSocialMedia(
    @CurrentUser('id') userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
    @Body() dto: UpdateProfileSocialMediaDto,
  ) {
    return this.updateProfileSocialMediaUseCase.execute(
      userId,
      socialMediaId,
      dto,
    );
  }

  @Delete('me/:socialMediaId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove current user's social media link" })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Social media removed' })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async removeOwnSocialMedia(
    @CurrentUser('id') userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
  ) {
    await this.removeProfileSocialMediaUseCase.execute(userId, socialMediaId);
  }

  @Get('by-user')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "Get any user's social media links (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiResponse({ status: 200, type: [ProfileSocialMediaResponseDto] })
  async findSocialMediasByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.getProfileSocialMediasUseCase.execute(userId);
  }

  @Post('by-user')
  @RequirePermissions('profiles.create')
  @ApiOperation({
    summary: "Add social media link to any user's profile (Admin only)",
  })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiResponse({ status: 201, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform already linked' })
  async addSocialMediaByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateProfileSocialMediaDto,
  ) {
    return this.addProfileSocialMediaUseCase.execute(userId, dto);
  }

  @Patch(':socialMediaId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update any user's social media link (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async updateSocialMediaByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
    @Body() dto: UpdateProfileSocialMediaDto,
  ) {
    return this.updateProfileSocialMediaUseCase.execute(
      userId,
      socialMediaId,
      dto,
    );
  }

  @Delete(':socialMediaId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove any user's social media link (Admin only)" })
  @ApiQuery({ name: 'userId', required: true, format: 'uuid' })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Social media removed' })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async removeSocialMediaByAdmin(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
  ) {
    await this.removeProfileSocialMediaUseCase.execute(userId, socialMediaId);
  }
}
