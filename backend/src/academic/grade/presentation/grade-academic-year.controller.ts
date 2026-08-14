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
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { AssignCurriculumToGradeDto } from '../dto/request/assign-curriculum-to-grade.dto.js';
import { AssignCurriculumToGradeUseCase } from '../use-cases/assign-curriculum-to-grade.use-case.js';
import { GetGradeAcademicYearsUseCase } from '../use-cases/get-grade-academic-years.use-case.js';
import { RemoveCurriculumFromGradeUseCase } from '../use-cases/remove-curriculum-from-grade.use-case.js';

@ApiTags('Grade Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
/**
 * Which curriculum a grade follows in a given academic year.
 *
 * `curricula.*` rather than `classrooms.*`: the thing being decided is the
 * curriculum, and assigning or removing one changes an existing curriculum's
 * reach rather than creating or deleting it — hence `update` on both writes.
 * This controller had no permission decorator at all, which the guard reads as
 * "allowed" for anyone signed in.
 */
@Controller('grade-academic-years')
export class GradeAcademicYearController {
  constructor(
    private readonly assignService: AssignCurriculumToGradeUseCase,
    private readonly getService: GetGradeAcademicYearsUseCase,
    private readonly removeService: RemoveCurriculumFromGradeUseCase,
  ) {}

  @Get()
  @RequirePermissions('curricula.read')
  @ApiOperation({ summary: 'List grade-curriculum assignments' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of grade academic year assignments',
  })
  async findAll(@Query('academicYearId') academicYearId?: string) {
    return this.getService.execute(academicYearId);
  }

  @Post()
  @RequirePermissions('curricula.update')
  @ApiOperation({
    summary: 'Assign curriculum to grade for academic year (upsert)',
  })
  @ApiResponse({ status: 201, description: 'Assignment created or updated' })
  async assign(@Body() dto: AssignCurriculumToGradeDto) {
    return this.assignService.execute(dto);
  }

  @Delete(':id')
  @RequirePermissions('curricula.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove grade-curriculum assignment' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.removeService.execute(id);
  }
}
