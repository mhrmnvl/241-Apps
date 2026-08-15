import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { CreateWorkflowDto } from '../dto/request/create-workflow.dto.js';
import { CreateWorkflowUseCase } from '../use-cases/create-workflow.use-case.js';
import { GetWorkflowsUseCase } from '../use-cases/get-workflows.use-case.js';
import { GetWorkflowByIdUseCase } from '../use-cases/get-workflow-by-id.use-case.js';

@ApiTags('Inventory Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/workflows')
export class WorkflowController {
  constructor(
    private readonly getWorkflowsUseCase: GetWorkflowsUseCase,
    private readonly getWorkflowByIdUseCase: GetWorkflowByIdUseCase,
    private readonly createWorkflowUseCase: CreateWorkflowUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory-approvals.read')
  @ApiOperation({ summary: 'List all workflow templates' })
  async findAll() {
    return this.getWorkflowsUseCase.execute();
  }

  @Get(':id')
  @RequirePermissions('inventory-approvals.read')
  @ApiOperation({ summary: 'Get workflow template by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getWorkflowByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('inventory-approvals.create')
  @ApiOperation({ summary: 'Create a new workflow template' })
  async create(@Body() dto: CreateWorkflowDto) {
    return this.createWorkflowUseCase.execute(dto);
  }
}
