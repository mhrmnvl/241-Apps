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
import { GetStatusesUseCase } from '../use-cases/get-statuses.use-case.js';
import { CreateStatusUseCase } from '../use-cases/create-status.use-case.js';
import { UpdateStatusUseCase } from '../use-cases/update-status.use-case.js';
import { DeleteStatusUseCase } from '../use-cases/delete-status.use-case.js';
import { CreateStatusDto, UpdateStatusDto } from '../dto/request/status.dto.js';

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
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get status list' })
  async getStatuses(@Query('search') search?: string) {
    return this.getStatusesUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create status item' })
  async createStatus(@Body() data: CreateStatusDto) {
    return this.createStatusUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update status item' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateStatusDto,
  ) {
    return this.updateStatusUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Delete status item' })
  async deleteStatus(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteStatusUseCase.execute(id);
  }
}
