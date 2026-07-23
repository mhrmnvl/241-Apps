import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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

import { OccupationQueryDto } from '../dto/request/occupation-query.dto.js';
import {
  OccupationListResponseDto,
  OccupationResponseDto,
} from '../dto/response/occupation-response.dto.js';
import { CreateOccupationDto } from '../dto/request/create-occupation.dto.js';
import { UpdateOccupationDto } from '../dto/request/update-occupation.dto.js';
import { CreateOccupationUseCase } from '../use-cases/create-occupation.use-case.js';
import { DeleteOccupationUseCase } from '../use-cases/delete-occupation.use-case.js';
import { GetOccupationByIdUseCase } from '../use-cases/get-occupation-by-id.use-case.js';
import { GetOccupationsUseCase } from '../use-cases/get-occupations.use-case.js';
import { UpdateOccupationUseCase } from '../use-cases/update-occupation.use-case.js';

@ApiTags('Occupations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('occupations')
export class OccupationController {
  constructor(
    private readonly getOccupationsService: GetOccupationsUseCase,
    private readonly getOccupationByIdService: GetOccupationByIdUseCase,
    private readonly createOccupationService: CreateOccupationUseCase,
    private readonly updateOccupationService: UpdateOccupationUseCase,
    private readonly deleteOccupationService: DeleteOccupationUseCase,
  ) {}

  @Get()
  @RequirePermissions('occupations.read')
  @ApiOperation({ summary: 'List all occupations (paginated, filterable)' })
  @ApiResponse({ status: 200, type: OccupationListResponseDto })
  async findAll(@Query() query: OccupationQueryDto) {
    return this.getOccupationsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('occupations.read')
  @ApiOperation({ summary: 'Get an occupation by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: OccupationResponseDto })
  @ApiResponse({ status: 404, description: 'Occupation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getOccupationByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('occupations.create')
  @ApiOperation({ summary: 'Create a new occupation' })
  @ApiResponse({ status: 201, type: OccupationResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate occupation name' })
  async create(@Body() dto: CreateOccupationDto) {
    return this.createOccupationService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('occupations.update')
  @ApiOperation({ summary: 'Update an occupation' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: OccupationResponseDto })
  @ApiResponse({ status: 404, description: 'Occupation not found' })
  @ApiResponse({ status: 409, description: 'Duplicate occupation name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOccupationDto,
  ) {
    return this.updateOccupationService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('occupations.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an occupation (only if not in use)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Occupation deleted' })
  @ApiResponse({ status: 404, description: 'Occupation not found' })
  @ApiResponse({ status: 409, description: 'Occupation still in use' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteOccupationService.execute(id);
  }
}
