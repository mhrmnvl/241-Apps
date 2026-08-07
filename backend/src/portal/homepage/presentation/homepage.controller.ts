import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { IHomepageSectionRepository } from '../domain/interfaces/homepage-section-repository.interface.js';
import { UpdateHomepageSectionDto } from '../dto/request/update-homepage-section.dto.js';
import { HomepageSectionSettingDto } from '../dto/response/homepage-response.dto.js';
import { UpdateHomepageSectionUseCase } from '../use-cases/update-homepage-section.use-case.js';

@ApiTags('Portal — Homepage')
@ApiBearerAuth()
@Controller('portal/homepage/sections')
export class HomepageController {
  constructor(
    private readonly sectionRepository: IHomepageSectionRepository,
    private readonly updateSectionUseCase: UpdateHomepageSectionUseCase,
  ) {}

  @Get()
  @RequirePermissions('portal-settings.read')
  @ApiOperation({ summary: 'Homepage section configuration' })
  @ApiResponse({ status: 200, type: [HomepageSectionSettingDto] })
  async findAll(): Promise<HomepageSectionSettingDto[]> {
    return this.sectionRepository.findAll();
  }

  @Patch(':key')
  @RequirePermissions('portal-settings.update')
  @ApiParam({ name: 'key', example: 'berita' })
  @ApiOperation({
    summary: 'Change how many items a section shows, or hide it',
  })
  @ApiResponse({ status: 200, type: HomepageSectionSettingDto })
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateHomepageSectionDto,
  ) {
    return this.updateSectionUseCase.execute(key, dto);
  }
}
