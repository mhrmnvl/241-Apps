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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import { CreateStudentGraduationDto } from '../dto/request/create-student-graduation.dto.js';
import { BulkGraduationDto } from '../dto/request/bulk-graduation.dto.js';
import {
  BulkGraduationResultDto,
  GraduationCandidateListDto,
  GraduationHoldDto,
} from '../dto/response/graduation-candidate.dto.js';
import { GetGraduationCandidatesUseCase } from '../use-cases/get-graduation-candidates.use-case.js';
import { BulkGraduateStudentsUseCase } from '../use-cases/bulk-graduate-students.use-case.js';
import { GetGraduationHoldsUseCase } from '../use-cases/get-graduation-holds.use-case.js';
import { GraduationHoldQueryDto } from '../dto/request/graduation-hold-query.dto.js';
import { StudentGraduationQueryDto } from '../dto/request/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../dto/request/update-student-graduation.dto.js';
import { CreateStudentGraduationUseCase } from '../use-cases/create-student-graduation.use-case.js';
import { DeleteStudentGraduationUseCase } from '../use-cases/delete-student-graduation.use-case.js';
import { GetStudentGraduationByIdUseCase } from '../use-cases/get-student-graduation-by-id.use-case.js';
import { GetStudentGraduationsUseCase } from '../use-cases/get-student-graduations.use-case.js';
import { UpdateStudentGraduationUseCase } from '../use-cases/update-student-graduation.use-case.js';

@ApiTags('Graduations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-graduations')
export class GraduationController {
  constructor(
    private readonly getAllUC: GetStudentGraduationsUseCase,
    private readonly getByIdUC: GetStudentGraduationByIdUseCase,
    private readonly createUC: CreateStudentGraduationUseCase,
    private readonly updateUC: UpdateStudentGraduationUseCase,
    private readonly deleteUC: DeleteStudentGraduationUseCase,
    private readonly getCandidatesUC: GetGraduationCandidatesUseCase,
    private readonly bulkUC: BulkGraduateStudentsUseCase,
    private readonly getHoldsUC: GetGraduationHoldsUseCase,
  ) {}

  /**
   * Declared before `:id` on purpose — Nest matches in order, and `candidates`
   * would otherwise be read as a graduation id and fail as a malformed UUID.
   */
  @Get('candidates')
  @RequirePermissions('graduations.read')
  @ApiOperation({
    summary: 'Students eligible to graduate, from the active semester',
  })
  @ApiResponse({ status: 200, type: GraduationCandidateListDto })
  async findCandidates(): Promise<GraduationCandidateListDto> {
    return this.getCandidatesUC.execute();
  }

  /**
   * Declared before `:id` for the same reason as `candidates`.
   *
   * Behind `graduations.read` rather than a permission of its own: a hold is
   * half of the graduation decision, and a school that can see who finished
   * can see who did not. Inventing a second permission would mean a role that
   * reads the screen and cannot read half of what it shows.
   */
  @Get('holds')
  @RequirePermissions('graduations.read')
  @ApiOperation({
    summary: 'Students held back from graduating, newest decision first',
  })
  @ApiResponse({ status: 200, type: [GraduationHoldDto] })
  async findHolds(
    @Query() query: GraduationHoldQueryDto,
  ): Promise<GraduationHoldDto[]> {
    return this.getHoldsUC.execute(query.academicYearId);
  }

  @Post('bulk')
  @RequirePermissions('graduations.create')
  @ApiOperation({ summary: 'Graduate a cohort in one run' })
  @ApiResponse({ status: 201, type: BulkGraduationResultDto })
  async bulkGraduate(
    @Body() dto: BulkGraduationDto,
  ): Promise<BulkGraduationResultDto> {
    return this.bulkUC.execute(dto);
  }

  @Get()
  @RequirePermissions('graduations.read')
  @ApiOperation({ summary: 'List student graduations' })
  async findAll(@Query() query: StudentGraduationQueryDto) {
    return this.getAllUC.execute(query);
  }

  @Get(':id')
  @RequirePermissions('graduations.read')
  @ApiOperation({ summary: 'Get graduation by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdUC.execute(id);
  }

  @Post()
  @RequirePermissions('graduations.create')
  @ApiOperation({ summary: 'Create a graduation record' })
  @ApiResponse({ status: 201, description: 'Graduation created' })
  @ApiResponse({
    status: 409,
    description: 'Student already has a graduation record',
  })
  async create(@Body() dto: CreateStudentGraduationDto) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('graduations.update')
  @ApiOperation({ summary: 'Update graduation record' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentGraduationDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('graduations.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete graduation record' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Graduation deleted' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUC.execute(id);
  }
}
