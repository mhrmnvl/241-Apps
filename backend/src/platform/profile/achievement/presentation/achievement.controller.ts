import { RequirePermissions } from '../../../access-control/permissions/decorators/require-permissions.decorator.js';
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

import { AchievementQueryDto } from '../dto/request/achievement-query.dto.js';
import { CreateAchievementDto } from '../dto/request/create-achievement.dto.js';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';
import { CreateAchievementUseCase } from '../use-cases/create-achievement.use-case.js';
import { DeleteAchievementUseCase } from '../use-cases/delete-achievement.use-case.js';
import { GetAchievementByIdUseCase } from '../use-cases/get-achievement-by-id.use-case.js';
import { GetAchievementsUseCase } from '../use-cases/get-achievements.use-case.js';
import { UpdateAchievementUseCase } from '../use-cases/update-achievement.use-case.js';

@ApiTags('Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementController {
  constructor(
    private readonly createService: CreateAchievementUseCase,
    private readonly getListService: GetAchievementsUseCase,
    private readonly getByIdService: GetAchievementByIdUseCase,
    private readonly updateService: UpdateAchievementUseCase,
    private readonly deleteService: DeleteAchievementUseCase,
  ) {}

  @Post()
  @RequirePermissions('achievements.create')
  @ApiOperation({ summary: 'Create a new achievement' })
  create(@Body() dto: CreateAchievementDto) {
    return this.createService.execute(dto);
  }

  @Get()
  @RequirePermissions('achievements.read')
  @ApiOperation({
    summary: 'Get all achievements (filter by userId, type, year)',
  })
  findAll(@Query() query: AchievementQueryDto) {
    return this.getListService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('achievements.read')
  @ApiOperation({ summary: 'Get achievement by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdService.execute(id);
  }

  @Patch(':id')
  @RequirePermissions('achievements.update')
  @ApiOperation({ summary: 'Update achievement' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.updateService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('achievements.delete')
  @ApiOperation({ summary: 'Delete achievement (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteService.execute(id);
  }
}
