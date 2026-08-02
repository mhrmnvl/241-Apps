import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
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

import {
  ProfileResponseDto,
  UpdateProfileDto,
} from '../../../platform/profile/index.js';
import { UpdateStudentProfileUseCase } from '../use-cases/update-student-profile.use-case.js';

@ApiTags('Student Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentProfileController {
  constructor(
    private readonly updateStudentProfileService: UpdateStudentProfileUseCase,
  ) {}

  @Patch(':studentId')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: "Update student's profile" })
  @ApiParam({ name: 'studentId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async updateProfile(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ id: string; name: string } | null> {
    return this.updateStudentProfileService.execute(studentId, dto);
  }
}
