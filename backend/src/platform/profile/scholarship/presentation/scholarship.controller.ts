import { RequirePermissions } from '../../../access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/index.js';

import { CreateScholarshipDto } from '../dto/request/create-scholarship.dto.js';
import { ScholarshipQueryDto } from '../dto/request/scholarship-query.dto.js';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';
import { ScholarshipResponseDto } from '../dto/response/scholarship-response.dto.js';
import { CreateScholarshipUseCase } from '../use-cases/create-scholarship.use-case.js';
import { DeleteScholarshipUseCase } from '../use-cases/delete-scholarship.use-case.js';
import { GetScholarshipByIdUseCase } from '../use-cases/get-scholarship-by-id.use-case.js';
import { GetScholarshipsUseCase } from '../use-cases/get-scholarships.use-case.js';
import { UpdateScholarshipUseCase } from '../use-cases/update-scholarship.use-case.js';

@ApiTags('Scholarships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scholarships')
export class ScholarshipController {
  constructor(
    private readonly createService: CreateScholarshipUseCase,
    private readonly getListService: GetScholarshipsUseCase,
    private readonly getByIdService: GetScholarshipByIdUseCase,
    private readonly updateService: UpdateScholarshipUseCase,
    private readonly deleteService: DeleteScholarshipUseCase,
  ) {}

  @Post()
  @RequirePermissions('scholarships.create')
  @ApiOperation({ summary: 'Create a new scholarship' })
  @ApiResponse({ status: 201, type: ScholarshipResponseDto })
  create(@Body() dto: CreateScholarshipDto) {
    return this.createService.execute(dto);
  }

  @Get()
  @RequirePermissions('scholarships.read')
  @ApiOperation({ summary: 'Get all scholarships (filter by userId, status)' })
  @ApiResponse({ status: 200, type: [ScholarshipResponseDto] })
  findAll(@Query() query: ScholarshipQueryDto) {
    return this.getListService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('scholarships.read')
  @ApiOperation({ summary: 'Get scholarship by ID' })
  @ApiResponse({ status: 200, type: ScholarshipResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdService.execute(id);
  }

  @Patch(':id')
  @RequirePermissions('scholarships.update')
  @ApiOperation({ summary: 'Update scholarship' })
  @ApiResponse({ status: 200, type: ScholarshipResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScholarshipDto,
  ) {
    return this.updateService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('scholarships.delete')
  @ApiOperation({ summary: 'Delete scholarship (soft delete)' })
  @ApiResponse({ status: 200, type: ScholarshipResponseDto })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteService.execute(id);
  }
}
