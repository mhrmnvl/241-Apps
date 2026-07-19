import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';

import { CreateSchoolUnitTypeDto } from '../dto/create-school-unit-type.dto.js';
import { UpdateSchoolUnitTypeDto } from '../dto/update-school-unit-type.dto.js';
import { SchoolUnitTypeQueryDto } from '../dto/school-unit-type-query.dto.js';

import { CreateSchoolUnitTypeUseCase } from '../use-cases/create-school-unit-type.use-case.js';
import { UpdateSchoolUnitTypeUseCase } from '../use-cases/update-school-unit-type.use-case.js';
import { DeleteSchoolUnitTypeUseCase } from '../use-cases/delete-school-unit-type.use-case.js';
import { GetSchoolUnitTypesUseCase } from '../use-cases/get-school-unit-types.use-case.js';
import { GetSchoolUnitTypeByIdUseCase } from '../use-cases/get-school-unit-type-by-id.use-case.js';

@ApiTags('School Unit Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school-unit-types')
export class SchoolUnitTypesController {
  constructor(
    private readonly getSchoolUnitTypesUseCase: GetSchoolUnitTypesUseCase,
    private readonly getSchoolUnitTypeByIdUseCase: GetSchoolUnitTypeByIdUseCase,
    private readonly createSchoolUnitTypeUseCase: CreateSchoolUnitTypeUseCase,
    private readonly updateSchoolUnitTypeUseCase: UpdateSchoolUnitTypeUseCase,
    private readonly deleteSchoolUnitTypeUseCase: DeleteSchoolUnitTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('school-units.read')
  @ApiOperation({ summary: 'Get list of school unit types' })
  async findAll(@Query() query: SchoolUnitTypeQueryDto) {
    return this.getSchoolUnitTypesUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('school-units.read')
  @ApiOperation({ summary: 'Get school unit type by id' })
  async findOne(@Param('id') id: string) {
    return this.getSchoolUnitTypeByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('school-units.create')
  @ApiOperation({ summary: 'Create a new school unit type' })
  async create(@Body() dto: CreateSchoolUnitTypeDto) {
    return this.createSchoolUnitTypeUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('school-units.update')
  @ApiOperation({ summary: 'Update an existing school unit type' })
  async update(@Param('id') id: string, @Body() dto: UpdateSchoolUnitTypeDto) {
    return this.updateSchoolUnitTypeUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('school-units.update') // Admin-level permission for deletion
  @ApiOperation({ summary: 'Delete a school unit type' })
  async remove(@Param('id') id: string) {
    return this.deleteSchoolUnitTypeUseCase.execute(id);
  }
}
