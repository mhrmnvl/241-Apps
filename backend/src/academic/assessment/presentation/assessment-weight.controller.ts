import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
  Body,
  Controller,
  Get,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { ReplaceAssessmentWeightsDto } from '../dto/request/replace-assessment-weights.dto.js';
import { GetAssessmentWeightsUseCase } from '../use-cases/get-assessment-weights.use-case.js';
import { ReplaceAssessmentWeightsUseCase } from '../use-cases/replace-assessment-weights.use-case.js';

@ApiTags('AssessmentWeights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessment-weights')
export class AssessmentWeightController {
  constructor(
    private readonly getAssessmentWeightsService: GetAssessmentWeightsUseCase,
    private readonly replaceAssessmentWeightsService: ReplaceAssessmentWeightsUseCase,
  ) {}

  @Get()
  @RequirePermissions('assessment-items.read')
  @ApiOperation({
    summary: 'Get the per-type weights for one teaching assignment',
    description:
      'Always returns all five assessment types; those never set come back as zero.',
  })
  @ApiQuery({ name: 'teachingAssignmentId', format: 'uuid' })
  findAll(
    @Query('teachingAssignmentId', ParseUUIDPipe)
    teachingAssignmentId: string,
  ) {
    return this.getAssessmentWeightsService.execute(teachingAssignmentId);
  }

  @Put()
  @RequirePermissions('assessment-items.update')
  @ApiOperation({
    summary: 'Replace the per-type weights for one teaching assignment',
    description:
      'The submitted weights must total 100. Types omitted or set to zero contribute nothing to the subject score.',
  })
  replace(@Body() dto: ReplaceAssessmentWeightsDto) {
    return this.replaceAssessmentWeightsService.execute(dto);
  }
}
