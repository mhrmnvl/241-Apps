import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GetMetadataUseCase } from '../use-cases/get-metadata.use-case.js';

@ApiTags('Inventory Master Data Metadata')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class MetadataController {
  constructor(private readonly getMetadataUseCase: GetMetadataUseCase) {}

  @Get('metadata')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get metadata for inventory dropdowns' })
  async getMetadata() {
    return this.getMetadataUseCase.execute();
  }
}
