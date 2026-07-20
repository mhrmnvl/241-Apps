import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { AssignCurriculumToGradeDto } from '../dto/assign-curriculum-to-grade.dto.js';
import { AssignCurriculumToGradeUseCase } from '../use-cases/assign-curriculum-to-grade.use-case.js';
import { GetGradeAcademicYearsUseCase } from '../use-cases/get-grade-academic-years.use-case.js';
import { RemoveCurriculumFromGradeUseCase } from '../use-cases/remove-curriculum-from-grade.use-case.js';

@ApiTags('Grade Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grade-academic-years')
export class GradeAcademicYearController {
  constructor(
    private readonly assignService: AssignCurriculumToGradeUseCase,
    private readonly getService: GetGradeAcademicYearsUseCase,
    private readonly removeService: RemoveCurriculumFromGradeUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List grade-curriculum assignments' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of grade academic year assignments',
  })
  async findAll(
    @CurrentUser() _user: AuthenticatedUser,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.getService.execute(academicYearId);
  }

  @Post()
  @ApiOperation({
    summary: 'Assign curriculum to grade for academic year (upsert)',
  })
  @ApiResponse({ status: 201, description: 'Assignment created or updated' })
  async assign(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: AssignCurriculumToGradeDto,
  ) {
    return this.assignService.execute(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove grade-curriculum assignment' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async remove(
    @CurrentUser() _user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.removeService.execute(id);
  }
}
