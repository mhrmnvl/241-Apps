import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { AnnouncementQueryDto } from '../dto/announcement-query.dto.js';
import {
  AnnouncementListResponseDto,
  AnnouncementResponseDto,
} from '../dto/announcement-response.dto.js';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto.js';
import { CreateAnnouncementUseCase } from '../use-cases/create-announcement.use-case.js';
import { DeleteAnnouncementUseCase } from '../use-cases/delete-announcement.use-case.js';
import { GetAnnouncementByIdUseCase } from '../use-cases/get-announcement-by-id.use-case.js';
import { GetAnnouncementsUseCase } from '../use-cases/get-announcements.use-case.js';
import { UpdateAnnouncementUseCase } from '../use-cases/update-announcement.use-case.js';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementController {
  constructor(
    private readonly getAnnouncementsService: GetAnnouncementsUseCase,
    private readonly getAnnouncementByIdService: GetAnnouncementByIdUseCase,
    private readonly createAnnouncementService: CreateAnnouncementUseCase,
    private readonly updateAnnouncementService: UpdateAnnouncementUseCase,
    private readonly deleteAnnouncementService: DeleteAnnouncementUseCase,
  ) {}

  @Get()
  @RequirePermissions('announcements.read')
  @ApiOperation({ summary: 'List all announcements (paginated, filterable)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of announcements',
    type: AnnouncementListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnnouncementQueryDto,
  ) {
    return this.getAnnouncementsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('announcements.read')
  @ApiOperation({ summary: 'Get an announcement by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Announcement details',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getAnnouncementByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('announcements.create')
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({
    status: 201,
    description: 'Announcement created',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.createAnnouncementService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('announcements.update')
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated',
    type: AnnouncementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.updateAnnouncementService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('announcements.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Announcement deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteAnnouncementService.execute(id);
  }
}
