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
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../core/types/authenticated-user.type.js';
import { RequirePermissions } from '../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../platform/auth/index.js';
import { AdmissionAnnouncementQueryDto } from '../dto/request/admission-announcement-query.dto.js';
import { CreateAdmissionAnnouncementDto } from '../dto/request/create-admission-announcement.dto.js';
import { UpdateAdmissionAnnouncementDto } from '../dto/request/update-admission-announcement.dto.js';
import {
  CreateAdmissionAnnouncementUseCase,
  DeleteAdmissionAnnouncementUseCase,
  GetAdmissionAnnouncementsUseCase,
  PublishAdmissionAnnouncementUseCase,
  UpdateAdmissionAnnouncementUseCase,
} from '../use-cases/admission-announcement.use-cases.js';

@ApiTags('Admission — Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admissions/manage-announcements')
export class AdmissionAnnouncementController {
  constructor(
    private readonly getAnnouncementsService: GetAdmissionAnnouncementsUseCase,
    private readonly createAnnouncementService: CreateAdmissionAnnouncementUseCase,
    private readonly updateAnnouncementService: UpdateAdmissionAnnouncementUseCase,
    private readonly publishAnnouncementService: PublishAdmissionAnnouncementUseCase,
    private readonly deleteAnnouncementService: DeleteAdmissionAnnouncementUseCase,
  ) {}

  @Get()
  @RequirePermissions('admission-announcements.read')
  @ApiOperation({ summary: 'List admission announcements (admin)' })
  async findAll(@Query() query: AdmissionAnnouncementQueryDto) {
    return this.getAnnouncementsService.execute(query);
  }

  @Post()
  @RequirePermissions('admission-announcements.create')
  @ApiOperation({ summary: 'Create an admission announcement' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAdmissionAnnouncementDto,
  ) {
    return this.createAnnouncementService.execute(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('admission-announcements.update')
  @ApiOperation({ summary: 'Update an admission announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionAnnouncementDto,
  ) {
    return this.updateAnnouncementService.execute(id, dto);
  }

  @Post(':id/publish')
  @RequirePermissions('admission-announcements.update')
  @ApiOperation({ summary: 'Publish + notify applicants in scope' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishAnnouncementService.execute(id);
  }

  @Delete(':id')
  @RequirePermissions('admission-announcements.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an admission announcement' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAnnouncementService.execute(id);
  }
}
