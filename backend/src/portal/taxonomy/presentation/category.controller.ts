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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../dto/request/category.dto.js';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetPublicCategoriesUseCase,
  UpdateCategoryUseCase,
} from '../use-cases/manage-category.use-cases.js';
import { PortalPublic } from '../../shared/decorators/portal-public.decorator.js';

@ApiTags('Portal — Content')
@ApiBearerAuth()
@Controller('portal/categories')
export class CategoryController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  @RequirePermissions('portal-categories.read')
  @ApiOperation({ summary: 'Content categories, including deactivated ones' })
  async findAll() {
    return this.getCategoriesUseCase.execute();
  }

  @Post()
  @RequirePermissions('portal-categories.create')
  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({ status: 409, description: 'That address is already taken' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('portal-categories.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Rename, reorder, or deactivate a category' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('portal-categories.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Delete a category that nothing references' })
  @ApiResponse({
    status: 409,
    description: 'Still in use — the body names the count and some titles',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCategoryUseCase.execute(id);
  }
}

@ApiTags('Portal — Public')
@Controller('portal/public/categories')
export class CategoryPublicController {
  constructor(
    private readonly getPublicCategoriesUseCase: GetPublicCategoriesUseCase,
  ) {}

  @Get()
  @PortalPublic()
  @ApiOperation({
    summary: 'Active categories with published counts, for the filter bar',
  })
  async findAll() {
    return this.getPublicCategoriesUseCase.execute();
  }
}
