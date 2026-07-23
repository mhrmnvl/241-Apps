import { RequirePermissions } from '../../../access-control/permission/decorators/require-permissions.decorator.js';
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/index.js';

import { CreateEducationalHistoryDto } from '../dto/request/create-educational-history.dto.js';
import { EducationalHistoryQueryDto } from '../dto/request/educational-history-query.dto.js';
import { UpdateEducationalHistoryDto } from '../dto/request/update-educational-history.dto.js';
import { CreateEducationalHistoryUseCase } from '../use-cases/create-educational-history.use-case.js';
import { DeleteEducationalHistoryUseCase } from '../use-cases/delete-educational-history.use-case.js';
import { GetEducationalHistoriesUseCase } from '../use-cases/get-educational-histories.use-case.js';
import { GetEducationalHistoryByIdUseCase } from '../use-cases/get-educational-history-by-id.use-case.js';
import { UpdateEducationalHistoryUseCase } from '../use-cases/update-educational-history.use-case.js';

@ApiTags('Educational Histories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('educational-histories')
export class EducationalHistoryController {
  constructor(
    private readonly createService: CreateEducationalHistoryUseCase,
    private readonly getListService: GetEducationalHistoriesUseCase,
    private readonly getByIdService: GetEducationalHistoryByIdUseCase,
    private readonly updateService: UpdateEducationalHistoryUseCase,
    private readonly deleteService: DeleteEducationalHistoryUseCase,
  ) {}

  @Post()
  @RequirePermissions('educational-histories.create')
  @ApiOperation({ summary: 'Create a new educational history entry' })
  create(@Body() dto: CreateEducationalHistoryDto) {
    return this.createService.execute(dto);
  }

  @Get()
  @RequirePermissions('educational-histories.read')
  @ApiOperation({
    summary: 'Get all educational histories (filter by userId, level)',
  })
  findAll(@Query() query: EducationalHistoryQueryDto) {
    return this.getListService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('educational-histories.read')
  @ApiOperation({ summary: 'Get educational history by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdService.execute(id);
  }

  @Patch(':id')
  @RequirePermissions('educational-histories.update')
  @ApiOperation({ summary: 'Update educational history' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationalHistoryDto,
  ) {
    return this.updateService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('educational-histories.delete')
  @ApiOperation({ summary: 'Delete educational history (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteService.execute(id);
  }
}
