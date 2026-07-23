import { RequirePermissions } from '../../../access-control/permission/decorators/require-permissions.decorator.js';
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

import { CreateSocialMediaDto } from '../dto/request/create-social-media.dto.js';
import { SocialMediaQueryDto } from '../dto/request/social-media-query.dto.js';
import {
  SocialMediaListResponseDto,
  SocialMediaResponseDto,
} from '../dto/response/social-media-response.dto.js';
import { UpdateSocialMediaDto } from '../dto/request/update-social-media.dto.js';
import { CreateSocialMediaUseCase } from '../use-cases/create-social-media.use-case.js';
import { DeleteSocialMediaUseCase } from '../use-cases/delete-social-media.use-case.js';
import { GetSocialMediaByIdUseCase } from '../use-cases/get-social-media-by-id.use-case.js';
import { GetSocialMediasUseCase } from '../use-cases/get-social-medias.use-case.js';
import { UpdateSocialMediaUseCase } from '../use-cases/update-social-media.use-case.js';

@ApiTags('Social Medias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social-medias')
export class SocialMediaController {
  constructor(
    private readonly getPlatformsService: GetSocialMediasUseCase,
    private readonly getPlatformByIdService: GetSocialMediaByIdUseCase,
    private readonly createPlatformService: CreateSocialMediaUseCase,
    private readonly updatePlatformService: UpdateSocialMediaUseCase,
    private readonly deletePlatformService: DeleteSocialMediaUseCase,
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
