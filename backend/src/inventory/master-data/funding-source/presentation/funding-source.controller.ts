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
import { GetFundingSourcesUseCase } from '../use-cases/get-funding-sources.use-case.js';
import { CreateFundingSourceUseCase } from '../use-cases/create-funding-source.use-case.js';
import { UpdateFundingSourceUseCase } from '../use-cases/update-funding-source.use-case.js';
import { DeleteFundingSourceUseCase } from '../use-cases/delete-funding-source.use-case.js';
import { CreateFundingSourceDto } from '../dto/request/create-funding-source.dto.js';
import { UpdateFundingSourceDto } from '../dto/request/update-funding-source.dto.js';

@ApiTags('Inventory Funding Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/funding-sources')
export class FundingSourceController {
  constructor(
    private readonly getFundingSourcesUseCase: GetFundingSourcesUseCase,
    private readonly createFundingSourceUseCase: CreateFundingSourceUseCase,
    private readonly updateFundingSourceUseCase: UpdateFundingSourceUseCase,
    private readonly deleteFundingSourceUseCase: DeleteFundingSourceUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get funding source list' })
  async getFundingSources(@Query('search') search?: string) {
    return this.getFundingSourcesUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create funding source item' })
  async createFundingSource(@Body() data: CreateFundingSourceDto) {
    return this.createFundingSourceUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update funding source item' })
  async updateFundingSource(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateFundingSourceDto,
  ) {
    return this.updateFundingSourceUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Delete funding source item' })
  async deleteFundingSource(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteFundingSourceUseCase.execute(id);
  }
}
