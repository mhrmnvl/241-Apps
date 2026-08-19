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

/**
 * Social media links, under the profile they belong to.
 *
 * Every route here was unreachable. Three controllers were mounted at
 * `profiles` and this one is registered last, so Express matched
 * `ProfileController` or `ProfileAddressController` first for every path this
 * one declared — `GET /profiles/me`, `POST /profiles/me`, `PATCH
 * /profiles/me/:id` and `GET /profiles` all belonged to somebody else. The
 * frontend meanwhile called `/profiles/:userId/social-media-links`, which no
 * controller served at all, so the feature answered 404 from both directions.
 *
 * Nesting under the parent resource is what fixes it, and the paths are the
 * ones `profileApi.ts` already asks for.
 *
 * Self-service takes no permission: each `me` route resolves the caller through
 * `@CurrentUser` and the use case works *for that user*, so it cannot answer
 * about anyone else. It used to require `profiles.read`, `profiles.update` and
 * `profiles.delete` — the permissions that reach every profile in the school —
 * to let a person edit their own Instagram link.
 */
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

  /**
   * Every link in the school, paginated. A literal second segment, so it is
   * matched before `:userId/social-media-links` can swallow it.
   */
  @Get('social-media-links/all')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: 'List all social media links (paginated)' })
  @ApiResponse({ status: 200, type: ProfileSocialMediaListResponseDto })
  async getAllSocialMedias(@Query() query: ProfileSocialMediaQueryDto) {
    return this.getAllProfileSocialMediasUseCase.execute(query);
  }

  // `me` before `:userId`, or the literal is swallowed by the parameter.

  @Get('me/social-media-links')
  @ApiOperation({ summary: "List current user's social media links" })
  @ApiResponse({ status: 200, type: [ProfileSocialMediaResponseDto] })
  async getOwnSocialMedias(@CurrentUser('id') userId: string) {
    return this.getProfileSocialMediasUseCase.execute(userId);
  }

  @Post('me/social-media-links')
  @ApiOperation({ summary: "Add social media link to current user's profile" })
  @ApiResponse({ status: 201, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform already linked' })
  async addOwnSocialMedia(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProfileSocialMediaDto,
  ) {
    return this.addProfileSocialMediaUseCase.execute(userId, dto);
  }

  @Patch('me/social-media-links/:socialMediaId')
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

  @Delete('me/social-media-links/:socialMediaId')
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

  // Anyone's links. The user is in the path rather than a query string, so the
  // route reads as what it is and cannot be mistaken for the self-service one.

  @Get(':userId/social-media-links')
  @RequirePermissions('profiles.read')
  @ApiOperation({ summary: "Get any user's social media links" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200, type: [ProfileSocialMediaResponseDto] })
  async findSocialMediasByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.getProfileSocialMediasUseCase.execute(userId);
  }

  @Post(':userId/social-media-links')
  @RequirePermissions('profiles.create')
  @ApiOperation({ summary: "Add social media link to any user's profile" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 201, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform already linked' })
  async addSocialMediaByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateProfileSocialMediaDto,
  ) {
    return this.addProfileSocialMediaUseCase.execute(userId, dto);
  }

  @Patch(':userId/social-media-links/:socialMediaId')
  @RequirePermissions('profiles.update')
  @ApiOperation({ summary: "Update any user's social media link" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ProfileSocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async updateSocialMediaByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
    @Body() dto: UpdateProfileSocialMediaDto,
  ) {
    return this.updateProfileSocialMediaUseCase.execute(
      userId,
      socialMediaId,
      dto,
    );
  }

  @Delete(':userId/social-media-links/:socialMediaId')
  @RequirePermissions('profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove any user's social media link" })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiParam({ name: 'socialMediaId', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Social media removed' })
  @ApiResponse({ status: 404, description: 'Social media not found' })
  async removeSocialMediaByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('socialMediaId', ParseUUIDPipe) socialMediaId: string,
  ) {
    await this.removeProfileSocialMediaUseCase.execute(userId, socialMediaId);
  }
}
