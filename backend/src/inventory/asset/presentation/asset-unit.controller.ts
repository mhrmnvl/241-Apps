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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { AssetUnitQueryDto } from '../dto/request/asset-unit-query.dto.js';
import { UpdateUnitDto } from '../dto/request/update-unit.dto.js';
import { GetAssetUnitsUseCase } from '../use-cases/get-asset-units.use-case.js';
import { UpdateUnitUseCase } from '../use-cases/update-unit.use-case.js';
import { DeleteUnitUseCase } from '../use-cases/delete-unit.use-case.js';

@ApiTags('Inventory Asset Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/asset-units')
export class AssetUnitController {
  constructor(
    private readonly getAssetUnitsUseCase: GetAssetUnitsUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase,
    private readonly deleteUnitUseCase: DeleteUnitUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({
    summary: 'List asset units (paginated, searchable, lendable-only)',
  })
  async findAll(@Query() query: AssetUnitQueryDto) {
    return this.getAssetUnitsUseCase.execute(query);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({
    summary: 'Update an asset unit (condition/status/location/custodian/etc.)',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.updateUnitUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Soft-delete an asset unit' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUnitUseCase.execute(id);
  }
}
