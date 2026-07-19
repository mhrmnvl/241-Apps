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

import { PositionQueryDto } from '../dto/position-query.dto.js';
import {
  PositionListResponseDto,
  PositionResponseDto,
} from '../dto/position-response.dto.js';
import { CreatePositionDto } from '../dto/create-position.dto.js';
import { UpdatePositionDto } from '../dto/update-position.dto.js';
import { CreatePositionUseCase } from '../use-cases/create-position.use-case.js';
import { DeletePositionUseCase } from '../use-cases/delete-position.use-case.js';
import { GetPositionByIdUseCase } from '../use-cases/get-position-by-id.use-case.js';
import { GetPositionsUseCase } from '../use-cases/get-positions.use-case.js';
import { UpdatePositionUseCase } from '../use-cases/update-position.use-case.js';

@ApiTags('Positions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('positions')
export class PositionController {
  constructor(
    private readonly getPositionsService: GetPositionsUseCase,
    private readonly getPositionByIdService: GetPositionByIdUseCase,
    private readonly createPositionService: CreatePositionUseCase,
    private readonly updatePositionService: UpdatePositionUseCase,
    private readonly deletePositionService: DeletePositionUseCase,
  ) {}

  @Get()
  @RequirePermissions('positions.read')
  @ApiOperation({ summary: 'List all positions (paginated, filterable)' })
  @ApiResponse({ status: 200, type: PositionListResponseDto })
  async findAll(@Query() query: PositionQueryDto) {
    return this.getPositionsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('positions.read')
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPositionByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('positions.create')
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, type: PositionResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate position name' })
  async create(@Body() dto: CreatePositionDto) {
    return this.createPositionService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('positions.update')
  @ApiOperation({ summary: 'Update a position' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: PositionResponseDto })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiResponse({ status: 409, description: 'Duplicate position name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.updatePositionService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('positions.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a position (only if not in use)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Position deleted' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiResponse({ status: 409, description: 'Position still in use' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePositionService.execute(id);
  }
}
