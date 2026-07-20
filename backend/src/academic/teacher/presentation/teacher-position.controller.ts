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
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../dto/request/teacher-position.dto.js';
import { TeacherPositionResponseDto } from '../dto/response/teacher-position-response.dto.js';
import { TeacherPositionUseCase } from '../use-cases/teacher-position.use-case.js';

@ApiTags('Teacher Positions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teacher-positions')
export class TeacherPositionsController {
  constructor(private readonly positionUseCase: TeacherPositionUseCase) {}

  @Get()
  @RequirePermissions('teachers.read')
  @ApiOperation({ summary: "Get teacher's position assignments" })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiResponse({ status: 200, type: [TeacherPositionResponseDto] })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async findAll(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionUseCase.findAll(teacherId);
  }

  @Post()
  @RequirePermissions('teachers.create')
  @ApiOperation({ summary: 'Assign a position to an teacher' })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiResponse({ status: 201, type: TeacherPositionResponseDto })
  @ApiResponse({ status: 400, description: 'Position is inactive' })
  @ApiResponse({ status: 404, description: 'Teacher or position not found' })
  @ApiResponse({
    status: 409,
    description: 'Same position already assigned on that date',
  })
  async assign(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Body() dto: CreateTeacherPositionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionUseCase.assign(teacherId, dto);
  }

  @Patch(':id')
  @RequirePermissions('teachers.update')
  @ApiOperation({
    summary: 'Update a position assignment (hireDate / isPrimary)',
  })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiParam({
    name: 'id',
    description: 'TeacherPosition link ID',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, type: TeacherPositionResponseDto })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async update(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherPositionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.positionUseCase.update(teacherId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('teachers.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a position assignment' })
  @ApiQuery({ name: 'teacherId', required: true, format: 'uuid' })
  @ApiParam({
    name: 'id',
    description: 'TeacherPosition link ID',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Assignment removed' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async remove(
    @Query('teacherId', ParseUUIDPipe) teacherId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.positionUseCase.remove(teacherId, id);
  }
}
