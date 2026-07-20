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
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { GradeQueryDto } from '../dto/grade-query.dto.js';
import { GradeResponseDto } from '../dto/grade-response.dto.js';
import { CreateGradeDto } from '../dto/create-grade.dto.js';
import { UpdateGradeDto } from '../dto/update-grade.dto.js';
import { CreateGradeUseCase } from '../use-cases/create-grade.use-case.js';
import { DeleteGradeUseCase } from '../use-cases/delete-grade.use-case.js';
import { GetGradeByIdUseCase } from '../use-cases/get-grade-by-id.use-case.js';
import { GetGradesUseCase } from '../use-cases/get-grades.use-case.js';
import { UpdateGradeUseCase } from '../use-cases/update-grade.use-case.js';

@ApiTags('Grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Get all classroom levels' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GradeQueryDto,
  ) {
    return this.getGradesService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get classroom level by ID' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getGradeByIdService.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new classroom level' })
  @ApiResponse({ status: 201, type: GradeResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate level or name' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGradeDto,
  ) {
    return this.createGradeService.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a classroom level' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  @ApiResponse({ status: 409, description: 'Duplicate level or name' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.updateGradeService.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a classroom level (soft delete)' })
  @ApiResponse({ status: 204, description: 'Classroom level deleted' })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteGradeService.execute(id);
  }
}
