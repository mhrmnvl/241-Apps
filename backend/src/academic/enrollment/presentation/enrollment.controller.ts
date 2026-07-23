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

import { DropStudentDto } from '../dto/request/drop-student.dto.js';
import { BulkCreateStudentEnrollmentDto } from '../dto/request/bulk-create-student-enrollment.dto.js';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { StudentEnrollmentQueryDto } from '../dto/request/student-enrollment-query.dto.js';
import { UpdateStudentEnrollmentDto } from '../dto/request/update-student-enrollment.dto.js';
import { TransferStudentDto } from '../dto/request/transfer-student.dto.js';
import { BulkTransferStudentDto } from '../dto/request/bulk-transfer-student.dto.js';
import { BulkCreateStudentEnrollmentUseCase } from '../use-cases/bulk-create-student-enrollment.use-case.js';
import { CreateStudentEnrollmentUseCase } from '../use-cases/create-student-enrollment.use-case.js';
import { DeleteStudentEnrollmentUseCase } from '../use-cases/delete-student-enrollment.use-case.js';
import { DropStudentUseCase } from '../use-cases/drop-student.use-case.js';
import { GetStudentEnrollmentByIdUseCase } from '../use-cases/get-student-enrollment-by-id.use-case.js';
import { GetStudentEnrollmentsUseCase } from '../use-cases/get-student-enrollments.use-case.js';
import { TransferStudentUseCase } from '../use-cases/transfer-student.use-case.js';
import { BulkTransferStudentUseCase } from '../use-cases/bulk-transfer-student.use-case.js';
import { UpdateStudentEnrollmentUseCase } from '../use-cases/update-student-enrollment.use-case.js';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-enrollments')
export class EnrollmentController {
  constructor(
    private readonly getAll: GetStudentEnrollmentsUseCase,
    private readonly getById: GetStudentEnrollmentByIdUseCase,
    private readonly createUC: CreateStudentEnrollmentUseCase,
    private readonly bulkCreateUC: BulkCreateStudentEnrollmentUseCase,
    private readonly updateUC: UpdateStudentEnrollmentUseCase,
    private readonly deleteUC: DeleteStudentEnrollmentUseCase,
    private readonly transferUC: TransferStudentUseCase,
    private readonly bulkTransferUC: BulkTransferStudentUseCase,
    private readonly dropUC: DropStudentUseCase,
  ) {}

  @Get()
  @RequirePermissions('enrollments.read')
  @ApiOperation({ summary: 'List student enrollments' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: StudentEnrollmentQueryDto,
  ) {
    return this.getAll.execute(q);
  }

  @Get(':id')
  @RequirePermissions('enrollments.read')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('enrollments.create')
  @ApiOperation({ summary: 'Create enrollment' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudentEnrollmentDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Post('bulk')
  @RequirePermissions('enrollments.create')
  @ApiOperation({ summary: 'Bulk create enrollments' })
  async bulkCreate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkCreateStudentEnrollmentDto,
  ) {
    return this.bulkCreateUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('enrollments.update')
  @ApiOperation({ summary: 'Update enrollment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentEnrollmentDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Patch(':id/transfer')
  @RequirePermissions('enrollments.update')
  @ApiOperation({ summary: 'Transfer student to a different class' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Student transferred' })
  @ApiResponse({ status: 400, description: 'Enrollment is not ACTIVE' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferStudentDto,
  ) {
    return this.transferUC.execute(id, dto);
  }

  @Post('bulk-transfer')
  @RequirePermissions('enrollments.create')
  @ApiOperation({ summary: 'Bulk transfer students to a different class' })
  @ApiResponse({ status: 201, description: 'Bulk transfer completed' })
  async bulkTransfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkTransferStudentDto,
  ) {
    return this.bulkTransferUC.execute(dto);
  }

  @Patch(':id/drop')
  @RequirePermissions('enrollments.update')
  @ApiOperation({ summary: 'Drop a student from enrollment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Student dropped' })
  @ApiResponse({ status: 400, description: 'Enrollment is not ACTIVE' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async drop(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DropStudentDto,
  ) {
    return this.dropUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('enrollments.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete enrollment' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
