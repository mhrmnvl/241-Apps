import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { UpdateUnitDto } from '../dto/request/update-unit.dto.js';
import { UpdateUnitUseCase } from '../use-cases/update-unit.use-case.js';
import { DeleteUnitUseCase } from '../use-cases/delete-unit.use-case.js';

@ApiTags('Inventory Asset Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/asset-units')
export class AssetUnitController {
  constructor(
    private readonly updateUnitUseCase: UpdateUnitUseCase,
    private readonly deleteUnitUseCase: DeleteUnitUseCase,
  ) {}

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
