import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import {
  EventListResponseDto,
  EventResponseDto,
} from '../dto/event-response.dto.js';
import { CreateEventDto } from '../dto/create-event.dto.js';
import { UpdateEventDto } from '../dto/update-event.dto.js';
import { EventQueryDto } from '../dto/event-query.dto.js';
import { CreateEventUseCase } from '../use-cases/create-event.use-case.js';
import { DeleteEventUseCase } from '../use-cases/delete-event.use-case.js';
import { GetEventByIdUseCase } from '../use-cases/get-event-by-id.use-case.js';
import { GetEventsUseCase } from '../use-cases/get-events.use-case.js';
import { UpdateEventUseCase } from '../use-cases/update-event.use-case.js';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly getEventsService: GetEventsUseCase,
    private readonly getEventByIdService: GetEventByIdUseCase,
    private readonly createEventService: CreateEventUseCase,
    private readonly updateEventService: UpdateEventUseCase,
    private readonly deleteEventService: DeleteEventUseCase,
  ) {}

  @Get()
  @RequirePermissions('events.read')
  @ApiOperation({ summary: 'List all events (paginated, filterable)' })
  @ApiResponse({ status: 200, type: EventListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: EventQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.getEventsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('events.read')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.getEventByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('events.create')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createEventService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('events.update')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateEventService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('events.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an event' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.deleteEventService.execute(id);
  }
}
