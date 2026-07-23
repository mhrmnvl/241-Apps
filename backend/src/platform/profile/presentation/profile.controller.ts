import { RequirePermissions } from '../../access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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

import { ProfileResponseDto } from '../dto/response/profile-response.dto.js';
import { UpdateProfileDto } from '../dto/request/update-profile.dto.js';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case.js';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
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
