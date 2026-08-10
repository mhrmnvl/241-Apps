import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import type { SalaryComponentEntity } from '../domain/entities/salary-component.entity.js';
import { CreateSalaryComponentDto } from '../dto/request/create-salary-component.dto.js';
import { UpdateSalaryComponentDto } from '../dto/request/update-salary-component.dto.js';
import {
  CreateSalaryComponentUseCase,
  DeleteSalaryComponentUseCase,
  GetSalaryComponentsUseCase,
  UpdateSalaryComponentUseCase,
} from '../use-cases/manage-salary-component.use-case.js';

/**
 * Every route carries a `payroll-*` permission, which is exempt from the ADMIN
 * role bypass (ADR-0008) — holding ADMIN grants nothing here.
 */
@ApiTags('Payroll — Salary Components')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll/components')
export class SalaryComponentController {
  constructor(
    private readonly getAll: GetSalaryComponentsUseCase,
    private readonly createUC: CreateSalaryComponentUseCase,
    private readonly updateUC: UpdateSalaryComponentUseCase,
    private readonly deleteUC: DeleteSalaryComponentUseCase,
  ) {}

  @Get()
  @RequirePermissions('payroll-components.read')
  async list(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<SalaryComponentEntity[]> {
    return this.getAll.execute(includeInactive === 'true');
  }

  @Post()
  @RequirePermissions('payroll-components.create')
  async create(
    @Body() dto: CreateSalaryComponentDto,
  ): Promise<SalaryComponentEntity> {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('payroll-components.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryComponentDto,
  ): Promise<SalaryComponentEntity> {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('payroll-components.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Refused while any assignment still uses it' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SalaryComponentEntity> {
    return this.deleteUC.execute(id);
  }
}
