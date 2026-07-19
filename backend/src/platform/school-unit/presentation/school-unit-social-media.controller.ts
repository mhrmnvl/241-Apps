import { RequirePermissions } from '../../access-control/permissions/decorators/require-permissions.decorator.js';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/index.js';

import { SchoolUnitSocialMediaResponseDto } from '../dto/school-unit-social-media-response.dto.js';
import {
  CreateSchoolUnitSocialMediaDto,
  UpdateSchoolUnitSocialMediaDto,
} from '../dto/school-unit-social-media.dto.js';
import { SchoolUnitSocialMediaUseCase } from '../use-cases/school-unit-social-media.use-case.js';

@ApiTags('School Unit Social Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school-unit-social-medias')
export class SchoolUnitSocialMediaController {
  constructor(private readonly useCase: SchoolUnitSocialMediaUseCase) {}

  @Get()
  @RequirePermissions('school-units.read')
  @ApiOperation({ summary: 'Get school unit social media links' })
  @ApiResponse({ status: 200, type: [SchoolUnitSocialMediaResponseDto] })
  async findAll() {
    return this.useCase.findAll();
  }

  @Post()
  @RequirePermissions('school-units.create')
  @ApiOperation({ summary: 'Add social media link to school unit' })
  @ApiResponse({ status: 201, type: SchoolUnitSocialMediaResponseDto })
  @ApiResponse({ status: 409, description: 'Platform already linked' })
  async create(@Body() dto: CreateSchoolUnitSocialMediaDto) {
    return this.useCase.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('school-units.update')
  @ApiOperation({ summary: 'Update a social media link entry' })
  @ApiParam({ name: 'id', description: 'Social media link ID', format: 'uuid' })
  @ApiResponse({ status: 200, type: SchoolUnitSocialMediaResponseDto })
  @ApiResponse({ status: 404, description: 'Social media link not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSchoolUnitSocialMediaDto,
  ) {
    return this.useCase.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('school-units.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a social media link' })
  @ApiParam({ name: 'id', description: 'Social media link ID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Social media link removed' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.useCase.remove(id);
  }
}
