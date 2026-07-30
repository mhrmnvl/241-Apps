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
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CreateStudentScoreDto } from '../dto/request/create-student-score.dto.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';
import { GetStudentScoresUseCase } from '../use-cases/get-student-scores.use-case.js';
import { GetStudentScoreByIdUseCase } from '../use-cases/get-student-score-by-id.use-case.js';
import { CreateStudentScoreUseCase } from '../use-cases/create-student-score.use-case.js';
import { UpdateStudentScoreUseCase } from '../use-cases/update-student-score.use-case.js';
import { DeleteStudentScoreUseCase } from '../use-cases/delete-student-score.use-case.js';
import { GetStudentScoreRosterUseCase } from '../use-cases/get-student-score-roster.use-case.js';
import { BulkUpsertStudentScoresUseCase } from '../use-cases/bulk-upsert-student-scores.use-case.js';

@ApiTags('Student Scores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-scores')
export class StudentScoresController {
  constructor(
    private readonly getAll: GetStudentScoresUseCase,
    private readonly getById: GetStudentScoreByIdUseCase,
    private readonly createUC: CreateStudentScoreUseCase,
    private readonly updateUC: UpdateStudentScoreUseCase,
    private readonly deleteUC: DeleteStudentScoreUseCase,
    private readonly rosterUC: GetStudentScoreRosterUseCase,
    private readonly bulkUpsertUC: BulkUpsertStudentScoresUseCase,
  ) {}

  @Get()
  @RequirePermissions('student-scores.read')
  @ApiOperation({ summary: 'List student scores' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: StudentScoreQueryDto,
  ) {
    return this.getAll.execute(q);
  }

  @Get('roster')
  @RequirePermissions('student-scores.read')
  @ApiOperation({
    summary: 'Get the full class roster with scores for one assessment item',
  })
  async getRoster(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: StudentScoreRosterQueryDto,
  ) {
    return this.rosterUC.execute(q);
  }

  @Get(':id')
  @RequirePermissions('student-scores.read')
  @ApiOperation({ summary: 'Get student score by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('student-scores.create')
  @ApiOperation({ summary: 'Create student score' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudentScoreDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Post('bulk')
  @RequirePermissions('student-scores.manage')
  @ApiOperation({
    summary: 'Bulk upsert scores for a class on one assessment item',
  })
  async bulkUpsert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkUpsertStudentScoreDto,
  ) {
    return this.bulkUpsertUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('student-scores.update')
  @ApiOperation({ summary: 'Update student score' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentScoreDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('student-scores.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student score' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
