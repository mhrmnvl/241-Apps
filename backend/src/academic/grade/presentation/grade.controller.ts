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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GradeQueryDto } from '../dto/request/grade-query.dto.js';
import { GradeResponseDto } from '../dto/response/grade-response.dto.js';
import { CreateGradeDto } from '../dto/request/create-grade.dto.js';
import { UpdateGradeDto } from '../dto/request/update-grade.dto.js';
import { CreateGradeUseCase } from '../use-cases/create-grade.use-case.js';
import { DeleteGradeUseCase } from '../use-cases/delete-grade.use-case.js';
import { GetGradeByIdUseCase } from '../use-cases/get-grade-by-id.use-case.js';
import { GetGradesUseCase } from '../use-cases/get-grades.use-case.js';
import { UpdateGradeUseCase } from '../use-cases/update-grade.use-case.js';

@ApiTags('Grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
/**
 * Classroom levels — VII, VIII, IX and their equivalents.
 *
 * Guarded by `classrooms.*` because that is the permission set the school has
 * for this data; there is no `grades.*`. Until this was added the controller
 * carried only `JwtAuthGuard`, and the permission guard treats a missing
 * decorator as "allowed", so any signed-in account — including every student —
 * could create, rename or delete a level.
 */
@Controller('grades')
export class GradesController {
  constructor(
    private readonly getGradesService: GetGradesUseCase,
    private readonly getGradeByIdService: GetGradeByIdUseCase,
    private readonly createGradeService: CreateGradeUseCase,
    private readonly updateGradeService: UpdateGradeUseCase,
    private readonly deleteGradeService: DeleteGradeUseCase,
  ) {}

  @Get()
  @RequirePermissions('classrooms.read')
  @ApiOperation({ summary: 'Get all classroom levels' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  async findAll(@Query() query: GradeQueryDto) {
    return this.getGradesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('classrooms.read')
  @ApiOperation({ summary: 'Get classroom level by ID' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getGradeByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('classrooms.create')
  @ApiOperation({ summary: 'Create a new classroom level' })
  @ApiResponse({ status: 201, type: GradeResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate level or name' })
  async create(@Body() dto: CreateGradeDto) {
    return this.createGradeService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('classrooms.update')
  @ApiOperation({ summary: 'Update a classroom level' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  @ApiResponse({ status: 409, description: 'Duplicate level or name' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.updateGradeService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('classrooms.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a classroom level (soft delete)' })
  @ApiResponse({ status: 204, description: 'Classroom level deleted' })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteGradeService.execute(id);
  }
}
