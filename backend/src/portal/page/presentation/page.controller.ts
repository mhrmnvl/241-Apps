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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import {
  CreatePageDto,
  PageVersionDto,
  UpdatePageDto,
} from '../dto/request/page.dto.js';
import {
  CreatePageUseCase,
  DeletePageUseCase,
  GetPageByIdUseCase,
  GetPagesUseCase,
  PublishPageUseCase,
  UnpublishPageUseCase,
  UpdatePageUseCase,
} from '../use-cases/manage-page.use-cases.js';

@ApiTags('Portal — Content')
@ApiBearerAuth()
@Controller('portal/pages')
export class PageController {
  constructor(
    private readonly getPagesUseCase: GetPagesUseCase,
    private readonly getPageByIdUseCase: GetPageByIdUseCase,
    private readonly createPageUseCase: CreatePageUseCase,
    private readonly updatePageUseCase: UpdatePageUseCase,
    private readonly publishPageUseCase: PublishPageUseCase,
    private readonly unpublishPageUseCase: UnpublishPageUseCase,
    private readonly deletePageUseCase: DeletePageUseCase,
  ) {}

  @Get()
  @RequirePermissions('portal-pages.read')
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiOperation({ summary: 'Informational pages' })
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    return this.getPagesUseCase.execute(includeDeleted === 'true');
  }

  @Get(':id')
  @RequirePermissions('portal-pages.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPageByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('portal-pages.create')
  @ApiOperation({ summary: 'Create a page — always starts as a draft' })
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createPageUseCase.execute(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('portal-pages.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 409, description: 'Someone else saved first' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.updatePageUseCase.execute(id, dto);
  }

  @Post(':id/publish')
  @RequirePermissions('portal-pages.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PageVersionDto,
  ) {
    return this.publishPageUseCase.execute(id, dto);
  }

  @Post(':id/unpublish')
  @RequirePermissions('portal-pages.publish')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary:
      'Take a page off the site — menu entries pointing at it drop out too',
  })
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PageVersionDto,
  ) {
    return this.unpublishPageUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-pages.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deletePageUseCase.execute(id);
  }
}
