import { RequirePermissions } from '../../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../../../platform/auth/index.js';

import { ReligionQueryDto } from '../dto/religion-query.dto.js';
import {
  ReligionsListResponseDto,
  ReligionResponseDto,
} from '../dto/religion-response.dto.js';
import { CreateReligionDto } from '../dto/create-religion.dto.js';
import { UpdateReligionDto } from '../dto/update-religion.dto.js';
import { CreateReligionUseCase } from '../use-cases/create-religion.use-case.js';
import { DeleteReligionUseCase } from '../use-cases/delete-religion.use-case.js';
import { GetReligionByIdUseCase } from '../use-cases/get-religion-by-id.use-case.js';
import { GetReligionsUseCase } from '../use-cases/get-religions.use-case.js';
import { UpdateReligionUseCase } from '../use-cases/update-religion.use-case.js';

@ApiTags('Religions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('religions')
export class ReligionController {
  constructor(
    private readonly getReligionsService: GetReligionsUseCase,
    private readonly getReligionByIdService: GetReligionByIdUseCase,
    private readonly createReligionService: CreateReligionUseCase,
    private readonly updateReligionService: UpdateReligionUseCase,
    private readonly deleteReligionService: DeleteReligionUseCase,
  ) {}

  @Get()
  @RequirePermissions('religions.read')
  @ApiOperation({
    summary: 'List all religions (paginated, filterable)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of religions',
    type: ReligionsListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: ReligionQueryDto) {
    return this.getReligionsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('religions.read')
  @ApiOperation({ summary: 'Get a religion by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Religion details',
    type: ReligionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getReligionByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('religions.create')
  @ApiOperation({ summary: 'Create a new religion' })
  @ApiResponse({
    status: 201,
    description: 'Religion created',
    type: ReligionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Religion name already exists' })
  async create(@Body() dto: CreateReligionDto) {
    return this.createReligionService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('religions.update')
  @ApiOperation({ summary: 'Update a religion' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Religion updated',
    type: ReligionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  @ApiResponse({ status: 409, description: 'Religion name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReligionDto,
  ) {
    return this.updateReligionService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('religions.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a religion' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Religion deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Religion not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteReligionService.execute(id);
  }
}
