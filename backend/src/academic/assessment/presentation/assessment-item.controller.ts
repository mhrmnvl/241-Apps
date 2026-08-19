import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';

import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';
import { AssessmentItemQueryDto } from '../dto/request/assessment-item-query.dto.js';
import { GetAssessmentItemsUseCase } from '../use-cases/get-assessment-items.use-case.js';
import { GetAssessmentItemByIdUseCase } from '../use-cases/get-assessment-item-by-id.use-case.js';
import { CreateAssessmentItemUseCase } from '../use-cases/create-assessment-item.use-case.js';
import { UpdateAssessmentItemUseCase } from '../use-cases/update-assessment-item.use-case.js';
import { DeleteAssessmentItemUseCase } from '../use-cases/delete-assessment-item.use-case.js';

@ApiTags('Assessment Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessment-items')
export class AssessmentItemController {
  constructor(
    private readonly getAll: GetAssessmentItemsUseCase,
    private readonly getById: GetAssessmentItemByIdUseCase,
    private readonly createUC: CreateAssessmentItemUseCase,
    private readonly updateUC: UpdateAssessmentItemUseCase,
    private readonly deleteUC: DeleteAssessmentItemUseCase,
  ) {}

  @Get()
  @RequirePermissions('assessment-items.read')
  @ApiOperation({ summary: 'List assessment items' })
  async findAll(@Query() q: AssessmentItemQueryDto) {
    return this.getAll.execute(q);
  }

  @Get(':id')
  @RequirePermissions('assessment-items.read')
  @ApiOperation({ summary: 'Get assessment item by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('assessment-items.create')
  @ApiOperation({ summary: 'Create assessment item' })
  async create(@Body() dto: CreateAssessmentItemDto) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('assessment-items.update')
  @ApiOperation({ summary: 'Update assessment item' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssessmentItemDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('assessment-items.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete assessment item' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUC.execute(id);
  }
}
