import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SemesterType } from '@prisma/client';
import { JwtAuthGuard } from '../../../../platform/auth/index.js';
import { CreateSemesterTypeDto } from '../dto/request/create-semester-type.dto.js';
import { SemesterTypeQueryDto } from '../dto/request/semester-type-query.dto.js';
import {
  SemesterTypeListResponseDto,
  SemesterTypeResponseDto,
} from '../dto/response/semester-type-response.dto.js';
import { UpdateSemesterTypeDto } from '../dto/request/update-semester-type.dto.js';
import { CreateSemesterTypeUseCase } from '../use-cases/create-semester-type.use-case.js';
import { DeleteSemesterTypeUseCase } from '../use-cases/delete-semester-type.use-case.js';
import { GetSemesterTypeByIdUseCase } from '../use-cases/get-semester-type-by-id.use-case.js';
import { GetSemesterTypesUseCase } from '../use-cases/get-semester-types.use-case.js';
import { UpdateSemesterTypeUseCase } from '../use-cases/update-semester-type.use-case.js';

@ApiTags('Semester Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('semester-types')
export class SemesterTypeController {
  constructor(
    private readonly getSemesterTypesService: GetSemesterTypesUseCase,
    private readonly getSemesterTypeByIdService: GetSemesterTypeByIdUseCase,
    private readonly createSemesterTypeService: CreateSemesterTypeUseCase,
    private readonly updateSemesterTypeService: UpdateSemesterTypeUseCase,
    private readonly deleteSemesterTypeService: DeleteSemesterTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('academic-calendar-types.read') // using existing permission or role-based
  @ApiOperation({ summary: 'List all semester types' })
  @ApiResponse({ status: 200, type: SemesterTypeListResponseDto })
  async findAll(@Query() query: SemesterTypeQueryDto): Promise<{
    data: SemesterType[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getSemesterTypesService.execute(query);
  }

  @Get(':id')
  @RequirePermissions('academic-calendar-types.read')
  @ApiOperation({ summary: 'Get a semester type by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SemesterTypeResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SemesterType> {
    return this.getSemesterTypeByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('academic-calendar-types.create')
  @ApiOperation({ summary: 'Create a new semester type' })
  @ApiResponse({ status: 201, type: SemesterTypeResponseDto })
  async create(@Body() dto: CreateSemesterTypeDto): Promise<SemesterType> {
    return this.createSemesterTypeService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('academic-calendar-types.update')
  @ApiOperation({ summary: 'Update a semester type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SemesterTypeResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSemesterTypeDto,
  ): Promise<SemesterType> {
    return this.updateSemesterTypeService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('academic-calendar-types.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a semester type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteSemesterTypeService.execute(id);
  }
}
