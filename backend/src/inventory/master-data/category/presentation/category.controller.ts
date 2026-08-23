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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../platform/auth/index.js';
import { RequirePermissions } from '../../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { GetCategoriesUseCase } from '../use-cases/get-categories.use-case.js';
import { CreateCategoryUseCase } from '../use-cases/create-category.use-case.js';
import { UpdateCategoryUseCase } from '../use-cases/update-category.use-case.js';
import { DeleteCategoryUseCase } from '../use-cases/delete-category.use-case.js';
import { CreateCategoryDto } from '../dto/request/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/request/update-category.dto.js';
import { InventoryCategoryResponseDto } from '../dto/response/category-response.dto.js';

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
  @RequirePermissions('inventory-master-data.read')
  @ApiOperation({ summary: 'Get category list' })
  @ApiResponse({ status: 200, type: [InventoryCategoryResponseDto] })
  async getCategories(@Query('search') search?: string) {
    return this.getCategoriesUseCase.execute(search);
  }

  @Post()
  @RequirePermissions('inventory-master-data.create')
  @ApiOperation({ summary: 'Create category item' })
  @ApiResponse({ status: 201, type: InventoryCategoryResponseDto })
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(data);
  }

  @Patch(':id')
  @RequirePermissions('inventory-master-data.update')
  @ApiOperation({ summary: 'Update category item' })
  @ApiResponse({ status: 200, type: InventoryCategoryResponseDto })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('inventory-master-data.delete')
  @ApiOperation({ summary: 'Delete category item' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCategoryUseCase.execute(id);
  }
}
