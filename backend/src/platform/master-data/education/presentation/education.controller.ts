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

import { EducationQueryDto } from '../dto/request/education-query.dto.js';
import {
  EducationListResponseDto,
  EducationResponseDto,
} from '../dto/response/education-response.dto.js';
import { CreateEducationDto } from '../dto/request/create-education.dto.js';
import { UpdateEducationDto } from '../dto/request/update-education.dto.js';
import { CreateEducationUseCase } from '../use-cases/create-education.use-case.js';
import { DeleteEducationUseCase } from '../use-cases/delete-education.use-case.js';
import { GetEducationByIdUseCase } from '../use-cases/get-education-by-id.use-case.js';
import { GetEducationsUseCase } from '../use-cases/get-educations.use-case.js';
import { UpdateEducationUseCase } from '../use-cases/update-education.use-case.js';

@ApiTags('Education Levels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('education-levels')
export class EducationController {
  constructor(
    private readonly getEducationsService: GetEducationsUseCase,
    private readonly getEducationByIdService: GetEducationByIdUseCase,
    private readonly createEducationService: CreateEducationUseCase,
    private readonly updateEducationService: UpdateEducationUseCase,
    private readonly deleteEducationService: DeleteEducationUseCase,
  ) {}

  @Get()
  @RequirePermissions('educations.read')
  @ApiOperation({
    summary: 'List all education levels (paginated, filterable)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of education levels',
    type: EducationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: EducationQueryDto) {
    return this.getEducationsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('educations.read')
  @ApiOperation({ summary: 'Get an education level by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Education details',
    type: EducationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getEducationByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('educations.create')
  @ApiOperation({ summary: 'Create a new education level' })
  @ApiResponse({
    status: 201,
    description: 'Education created',
    type: EducationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Education name already exists' })
  async create(@Body() dto: CreateEducationDto) {
    return this.createEducationService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('educations.update')
  @ApiOperation({ summary: 'Update an education level' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Education updated',
    type: EducationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  @ApiResponse({ status: 409, description: 'Education name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.updateEducationService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('educations.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an education level' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Education deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  @ApiResponse({ status: 409, description: 'Education is in use by parents' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteEducationService.execute(id);
  }
}
