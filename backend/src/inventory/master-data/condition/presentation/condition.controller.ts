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
import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GetConditionsUseCase } from '../use-cases/get-conditions.use-case.js';
import { CreateConditionUseCase } from '../use-cases/create-condition.use-case.js';
import { UpdateConditionUseCase } from '../use-cases/update-condition.use-case.js';
import { DeleteConditionUseCase } from '../use-cases/delete-condition.use-case.js';
import { CreateConditionDto } from '../dto/request/create-condition.dto.js';
import { UpdateConditionDto } from '../dto/request/update-condition.dto.js';

@ApiTags('Inventory Conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/conditions')
export class ConditionController {
  constructor(
    private readonly getConditionsUseCase: GetConditionsUseCase,
    private readonly createConditionUseCase: CreateConditionUseCase,
    private readonly updateConditionUseCase: UpdateConditionUseCase,
    private readonly deleteConditionUseCase: DeleteConditionUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get condition list' })
  async getConditions(@Query('search') search?: string) {
    return this.getConditionsUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create condition item' })
  async createCondition(@Body() data: CreateConditionDto) {
    return this.createConditionUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update condition item' })
  async updateCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateConditionDto,
  ) {
    return this.updateConditionUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Delete condition item' })
  async deleteCondition(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteConditionUseCase.execute(id);
  }
}
