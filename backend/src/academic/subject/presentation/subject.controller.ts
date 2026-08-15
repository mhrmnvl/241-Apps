import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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

import { SubjectQueryDto } from '../dto/request/subject-query.dto.js';
import { CreateSubjectDto } from '../dto/request/create-subject.dto.js';
import { UpdateSubjectDto } from '../dto/request/update-subject.dto.js';
import {
  SubjectListResponseDto,
  SubjectResponseDto,
} from '../dto/response/subject-response.dto.js';
import { CreateSubjectUseCase } from '../use-cases/create-subject.use-case.js';
import { DeleteSubjectUseCase } from '../use-cases/delete-subject.use-case.js';
import { GetSubjectByIdUseCase } from '../use-cases/get-subject-by-id.use-case.js';
import { GetSubjectsUseCase } from '../use-cases/get-subjects.use-case.js';
import { UpdateSubjectUseCase } from '../use-cases/update-subject.use-case.js';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectController {
  constructor(
    private readonly getSubjectsService: GetSubjectsUseCase,
    private readonly getSubjectByIdService: GetSubjectByIdUseCase,
    private readonly createSubjectService: CreateSubjectUseCase,
    private readonly updateSubjectService: UpdateSubjectUseCase,
    private readonly deleteSubjectService: DeleteSubjectUseCase,
  ) {}

  @Get()
  @RequirePermissions('subjects.read')
  @ApiOperation({ summary: 'List all subjects (paginated, searchable)' })
  @ApiResponse({ status: 200, type: SubjectListResponseDto })
  async findAll(@Query() query: SubjectQueryDto) {
    return this.getSubjectsService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('subjects.read')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SubjectResponseDto })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSubjectByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('subjects.create')
  @ApiOperation({ summary: 'Create a subject' })
  @ApiResponse({ status: 201, type: SubjectResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate subject name' })
  async create(@Body() dto: CreateSubjectDto) {
    return this.createSubjectService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('subjects.update')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SubjectResponseDto })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({ status: 409, description: 'Duplicate subject name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.updateSubjectService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('subjects.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subject (hard delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Subject deleted' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteSubjectService.execute(id);
  }
}
