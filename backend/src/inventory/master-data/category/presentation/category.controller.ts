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
import { GetCategoriesUseCase } from '../use-cases/get-categories.use-case.js';
import { CreateCategoryUseCase } from '../use-cases/create-category.use-case.js';
import { UpdateCategoryUseCase } from '../use-cases/update-category.use-case.js';
import { DeleteCategoryUseCase } from '../use-cases/delete-category.use-case.js';
import { CreateCategoryDto } from '../dto/request/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/request/update-category.dto.js';

@ApiTags('Inventory Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/categories')
export class CategoryController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get category list' })
  async getCategories(@Query('search') search?: string) {
    return this.getCategoriesUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Create category item' })
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update')
  @ApiOperation({ summary: 'Update category item' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory.delete')
  @ApiOperation({ summary: 'Delete category item' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCategoryUseCase.execute(id);
  }
}
