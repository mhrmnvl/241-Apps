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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../platform/auth/index.js';
import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GetStatusesUseCase } from '../use-cases/get-statuses.use-case.js';
import { CreateStatusUseCase } from '../use-cases/create-status.use-case.js';
import { UpdateStatusUseCase } from '../use-cases/update-status.use-case.js';
import { DeleteStatusUseCase } from '../use-cases/delete-status.use-case.js';
import { CreateStatusDto } from '../dto/request/create-status.dto.js';
import { UpdateStatusDto } from '../dto/request/update-status.dto.js';
import { InventoryStatusResponseDto } from '../dto/response/status-response.dto.js';

@ApiTags('Inventory Statuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/statuses')
export class StatusController {
  constructor(
    private readonly getStatusesUseCase: GetStatusesUseCase,
    private readonly createStatusUseCase: CreateStatusUseCase,
    private readonly updateStatusUseCase: UpdateStatusUseCase,
    private readonly deleteStatusUseCase: DeleteStatusUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory-master-data.read')
  @ApiOperation({ summary: 'Get status list' })
  @ApiResponse({ status: 200, type: [InventoryStatusResponseDto] })
  async getStatuses(@Query('search') search?: string) {
    return this.getStatusesUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory-master-data.create')
  @ApiOperation({ summary: 'Create status item' })
  @ApiResponse({ status: 201, type: InventoryStatusResponseDto })
  async createStatus(@Body() data: CreateStatusDto) {
    return this.createStatusUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory-master-data.update')
  @ApiOperation({ summary: 'Update status item' })
  @ApiResponse({ status: 200, type: InventoryStatusResponseDto })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateStatusDto,
  ) {
    return this.updateStatusUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory-master-data.delete')
  @ApiOperation({ summary: 'Delete status item' })
  async deleteStatus(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteStatusUseCase.execute(id);
  }
}
