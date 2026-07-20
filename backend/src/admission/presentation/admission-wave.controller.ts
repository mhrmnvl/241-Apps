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
import { RequirePermissions } from '../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../platform/auth/index.js';
import { AdmissionWaveQueryDto } from '../dto/request/admission-wave-query.dto.js';
import { CreateAdmissionWaveDto } from '../dto/request/create-admission-wave.dto.js';
import { UpdateAdmissionWaveDto } from '../dto/request/update-admission-wave.dto.js';
import {
  CreateAdmissionWaveUseCase,
  DeleteAdmissionWaveUseCase,
  GetAdmissionWaveByIdUseCase,
  GetAdmissionWavesUseCase,
  UpdateAdmissionWaveUseCase,
} from '../use-cases/admission-wave.use-cases.js';

@ApiTags('Admission — Waves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admissions/waves')
export class AdmissionWaveController {
  constructor(
    private readonly getWavesService: GetAdmissionWavesUseCase,
    private readonly getWaveByIdService: GetAdmissionWaveByIdUseCase,
    private readonly createWaveService: CreateAdmissionWaveUseCase,
    private readonly updateWaveService: UpdateAdmissionWaveUseCase,
    private readonly deleteWaveService: DeleteAdmissionWaveUseCase,
  ) {}

  @Get()
  @RequirePermissions('admission-waves.read')
  @ApiOperation({ summary: 'List admission waves' })
  async findAll(@Query() query: AdmissionWaveQueryDto) {
    return this.getWavesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('admission-waves.read')
  @ApiOperation({ summary: 'Get an admission wave' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getWaveByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('admission-waves.create')
  @ApiOperation({ summary: 'Create an admission wave' })
  async create(@Body() dto: CreateAdmissionWaveDto) {
    return this.createWaveService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('admission-waves.update')
  @ApiOperation({ summary: 'Update an admission wave' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionWaveDto,
  ) {
    return this.updateWaveService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('admission-waves.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft-delete an admission wave (no applicants only)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteWaveService.execute(id);
  }
}
