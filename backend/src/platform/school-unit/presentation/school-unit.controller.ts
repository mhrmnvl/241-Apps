import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';

import { SchoolUnitResponseDto } from '../dto/response/school-unit-response.dto.js';
import { CreateSchoolUnitDto } from '../dto/request/create-school-unit.dto.js';
import { UpdateSchoolUnitDto } from '../dto/request/update-school-unit.dto.js';
import { GetSchoolUnitUseCase } from '../use-cases/get-school-unit.use-case.js';
import { SetupSchoolUnitUseCase } from '../use-cases/setup-school-unit.use-case.js';
import { UpdateSchoolUnitUseCase } from '../use-cases/update-school-unit.use-case.js';

@ApiTags('School Unit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school-units')
export class SchoolUnitController {
  constructor(
    private readonly getSchoolUnitUseCase: GetSchoolUnitUseCase,
    private readonly setupSchoolUnitUseCase: SetupSchoolUnitUseCase,
    private readonly updateSchoolUnitUseCase: UpdateSchoolUnitUseCase,
  ) {}

  @Get()
  @RequirePermissions('school-units.read')
  @ApiOperation({ summary: 'Get school unit profile' })
  @ApiResponse({ status: 200, type: SchoolUnitResponseDto })
  @ApiResponse({ status: 404, description: 'School unit not set up yet' })
  async findOne() {
    return this.getSchoolUnitUseCase.execute();
  }

  @Post()
  @RequirePermissions('school-units.create')
  @ApiOperation({ summary: 'Create school unit' })
  @ApiResponse({ status: 201, type: SchoolUnitResponseDto })
  @ApiResponse({ status: 409, description: 'School unit already exists' })
  async setup(@Body() dto: CreateSchoolUnitDto) {
    return this.setupSchoolUnitUseCase.execute(dto);
  }

  @Patch()
  @RequirePermissions('school-units.update')
  @ApiOperation({ summary: 'Update school unit profile' })
  @ApiResponse({ status: 200, type: SchoolUnitResponseDto })
  async update(@Body() dto: UpdateSchoolUnitDto) {
    return this.updateSchoolUnitUseCase.execute(dto);
  }
}
