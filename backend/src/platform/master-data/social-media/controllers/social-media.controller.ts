import { RequirePermissions } from '../../../access-control/permissions/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../../auth/index.js';

import { CreateSocialMediaDto } from '../dto/create-social-media.dto.js';
import { SocialMediaQueryDto } from '../dto/social-media-query.dto.js';
import {
  SocialMediaListResponseDto,
  SocialMediaResponseDto,
} from '../dto/social-media-response.dto.js';
import { UpdateSocialMediaDto } from '../dto/update-social-media.dto.js';
import { CreateSocialMediaService } from '../services/create-social-media.service.js';
import { DeleteSocialMediaService } from '../services/delete-social-media.service.js';
import { GetSocialMediaByIdService } from '../services/get-social-media-by-id.service.js';
import { GetSocialMediasService } from '../services/get-social-medias.service.js';
import { UpdateSocialMediaService } from '../services/update-social-media.service.js';

@ApiTags('Social Medias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social-medias')
export class SocialMediaController {
  constructor(
    private readonly getPlatformsService: GetSocialMediasService,
    private readonly getPlatformByIdService: GetSocialMediaByIdService,
    private readonly createPlatformService: CreateSocialMediaService,
    private readonly updatePlatformService: UpdateSocialMediaService,
    private readonly deletePlatformService: DeleteSocialMediaService,
  ) {}

  @Get()
  @RequirePermissions('social-media.read')
  @ApiOperation({ summary: 'List all platforms (paginated)' })
  @ApiResponse({ status: 200, type: SocialMediaListResponseDto })
  async findAll(@Query() query: SocialMediaQueryDto) {
    return this.getPlatformsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('social-media.read')
  @ApiOperation({ summary: 'Get platform by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Platform not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPlatformByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('social-media.create')
  @ApiOperation({ summary: 'Create a new platform' })
  @ApiResponse({ status: 201, type: SocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform name already exists' })
  async create(@Body() dto: CreateSocialMediaDto) {
    return this.createPlatformService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('social-media.update')
  @ApiOperation({ summary: 'Update a platform' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Platform not found' })
  @ApiResponse({ status: 409, description: 'Platform name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSocialMediaDto,
  ) {
    return this.updatePlatformService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('social-media.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a platform (only if not in use)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Platform deleted' })
  @ApiResponse({ status: 404, description: 'Platform not found' })
  @ApiResponse({ status: 409, description: 'Platform still in use' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePlatformService.execute(id);
  }
}
