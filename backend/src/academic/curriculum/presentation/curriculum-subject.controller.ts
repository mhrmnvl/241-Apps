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
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CurriculumSubjectQueryDto } from '../dto/request/curriculum-subject-query.dto.js';
import { CreateCurriculumSubjectDto } from '../dto/request/create-curriculum-subject.dto.js';
import { UpdateCurriculumSubjectDto } from '../dto/request/update-curriculum-subject.dto.js';
import { GetCurriculumSubjectsUseCase } from '../use-cases/get-curriculum-subjects.use-case.js';
import { GetCurriculumSubjectByIdUseCase } from '../use-cases/get-curriculum-subject-by-id.use-case.js';
import { CreateCurriculumSubjectUseCase } from '../use-cases/create-curriculum-subject.use-case.js';
import { UpdateCurriculumSubjectUseCase } from '../use-cases/update-curriculum-subject.use-case.js';
import { DeleteCurriculumSubjectUseCase } from '../use-cases/delete-curriculum-subject.use-case.js';

@ApiTags('Curriculum Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('curriculum-subjects')
export class CurriculumSubjectController {
  constructor(
    private readonly getAll: GetCurriculumSubjectsUseCase,
    private readonly getById: GetCurriculumSubjectByIdUseCase,
    private readonly createService: CreateCurriculumSubjectUseCase,
    private readonly updateService: UpdateCurriculumSubjectUseCase,
    private readonly deleteService: DeleteCurriculumSubjectUseCase,
  ) {}

  @Get()
  @RequirePermissions('curriculum-subjects.read')
  @ApiOperation({ summary: 'List curriculum subjects' })
  @ApiResponse({ status: 200, description: 'Paginated list' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CurriculumSubjectQueryDto,
  ) {
    return this.getAll.execute(query);
  }

  @Get(':id')
  @RequirePermissions('curriculum-subjects.read')
  @ApiOperation({ summary: 'Get curriculum subject by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Curriculum subject details' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('curriculum-subjects.create')
  @ApiOperation({ summary: 'Create curriculum subject' })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(
    @Body() dto: CreateCurriculumSubjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('curriculum-subjects.update')
  @ApiOperation({ summary: 'Update curriculum subject' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCurriculumSubjectDto,
  ) {
    return this.updateService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('curriculum-subjects.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete curriculum subject' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteService.execute(id);
  }
}
