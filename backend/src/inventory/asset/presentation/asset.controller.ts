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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { CreateAssetDto } from '../dto/create-asset.dto.js';
import { UpdateAssetDto } from '../dto/update-asset.dto.js';
import { AssetQueryDto } from '../dto/asset-query.dto.js';
import { CreateAssetUseCase } from '../use-cases/create-asset.use-case.js';
import { UpdateAssetUseCase } from '../use-cases/update-asset.use-case.js';
import { DeleteAssetUseCase } from '../use-cases/delete-asset.use-case.js';
import { GetAssetByIdUseCase } from '../use-cases/get-asset-by-id.use-case.js';
import { GetAssetsUseCase } from '../use-cases/get-assets.use-case.js';

@ApiTags('Inventory Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/assets')
export class AssetController {
  constructor(
    private readonly getAssetsUseCase: GetAssetsUseCase,
    private readonly getAssetByIdUseCase: GetAssetByIdUseCase,
    private readonly createAssetUseCase: CreateAssetUseCase,
    private readonly updateAssetUseCase: UpdateAssetUseCase,
    private readonly deleteAssetUseCase: DeleteAssetUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({
    summary: 'List all inventory assets (paginated, filterable)',
  })
  async findAll(@Query() query: AssetQueryDto) {
    return this.getAssetsUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get asset by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAssetByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create a new asset' })
  async create(@Body() dto: CreateAssetDto) {
    return this.createAssetUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update an existing asset' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.updateAssetUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Soft-delete an asset' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteAssetUseCase.execute(id);
  }
}
