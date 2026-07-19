import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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

import { CreateStudentGraduationDto } from '../dto/create-student-graduation.dto.js';
import { StudentGraduationQueryDto } from '../dto/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../dto/update-student-graduation.dto.js';
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
  ) {}

  @Get()
  @RequirePermissions('graduations.read')
  @ApiOperation({ summary: 'List student graduations' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: StudentGraduationQueryDto,
  ) {
    return this.getAllUC.execute(query);
  }

  @Get(':id')
  @RequirePermissions('graduations.read')
  @ApiOperation({ summary: 'Get graduation by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
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
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudentGraduationDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('graduations.update')
  @ApiOperation({ summary: 'Update graduation record' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
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
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
