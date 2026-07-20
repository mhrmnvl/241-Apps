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
import { JwtAuthGuard } from '../../../../platform/auth/index.js';
import { RequirePermissions } from '../../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { GetLocationsUseCase } from '../use-cases/get-locations.use-case.js';
import { CreateLocationUseCase } from '../use-cases/create-location.use-case.js';
import { UpdateLocationUseCase } from '../use-cases/update-location.use-case.js';
import { DeleteLocationUseCase } from '../use-cases/delete-location.use-case.js';
import { CreateLocationDto } from '../dto/request/create-location.dto.js';
import { UpdateLocationDto } from '../dto/request/update-location.dto.js';

@ApiTags('Inventory Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/locations')
export class LocationController {
  constructor(
    private readonly getLocationsUseCase: GetLocationsUseCase,
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get location list' })
  async getLocations(@Query('search') search?: string) {
    return this.getLocationsUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create location item' })
  async createLocation(@Body() data: CreateLocationDto) {
    return this.createLocationUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update location item' })
  async updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateLocationDto,
  ) {
    return this.updateLocationUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Delete location item' })
  async deleteLocation(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteLocationUseCase.execute(id);
  }
}
