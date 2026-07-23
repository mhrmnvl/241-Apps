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
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';
import { AssessmentItemQueryDto } from '../dto/request/assessment-item-query.dto.js';
import {
  GetAssessmentItemsUseCase,
  GetAssessmentItemByIdUseCase,
  CreateAssessmentItemUseCase,
  UpdateAssessmentItemUseCase,
  DeleteAssessmentItemUseCase,
} from '../use-cases/assessment-item.use-case.js';

@ApiTags('Assessment Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessment-items')
export class AssessmentItemsController {
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
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: AssessmentItemQueryDto,
  ) {
    return this.getAll.execute(q);
  }

  @Get(':id')
  @RequirePermissions('assessment-items.read')
  @ApiOperation({ summary: 'Get assessment item by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('assessment-items.create')
  @ApiOperation({ summary: 'Create assessment item' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssessmentItemDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('assessment-items.update')
  @ApiOperation({ summary: 'Update assessment item' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
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
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
