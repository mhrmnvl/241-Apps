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
import { ClassroomLevelQueryDto } from '../dto/grade-query.dto.js';
import { GradeResponseDto } from '../dto/grade-response.dto.js';
import { CreateGradeDto } from '../dto/create-grade.dto.js';
import { UpdateGradeDto } from '../dto/update-grade.dto.js';
import { CreateClassroomLevelUseCase } from '../use-cases/create-grade.use-case.js';
import { DeleteClassroomLevelUseCase } from '../use-cases/delete-grade.use-case.js';
import { GetClassroomLevelByIdUseCase } from '../use-cases/get-grade-by-id.use-case.js';
import { GetClassroomLevelsUseCase } from '../use-cases/get-grades.use-case.js';
import { UpdateClassroomLevelUseCase } from '../use-cases/update-grade.use-case.js';

@ApiTags('Grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grades')
export class ClassroomLevelsController {
  constructor(
    private readonly getClassroomLevelsService: GetClassroomLevelsUseCase,
    private readonly getClassroomLevelByIdService: GetClassroomLevelByIdUseCase,
    private readonly createClassroomLevelService: CreateClassroomLevelUseCase,
    private readonly updateClassroomLevelService: UpdateClassroomLevelUseCase,
    private readonly deleteClassroomLevelService: DeleteClassroomLevelUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all classroom levels' })
  @ApiResponse({ status: 200, type: [GradeResponseDto] })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ClassroomLevelQueryDto,
  ) {
    return this.getClassroomLevelsService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get classroom level by ID' })
  @ApiResponse({ status: 200, type: GradeResponseDto })
  @ApiResponse({ status: 404, description: 'Classroom level not found' })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getClassroomLevelByIdService.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new classroom level' })
  @ApiResponse({ status: 201, type: GradeResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate level or name' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGradeDto,
  ) {
    return this.createClassroomLevelService.execute(dto);
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
    return this.updateClassroomLevelService.execute(id, dto);
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
    return this.deleteClassroomLevelService.execute(id);
  }
}
