import { Module } from '@nestjs/common';
import { CategoryController } from './presentation/category.controller.js';
import { CategoryRepository } from './infrastructure/persistence/prisma-category.repository.js';
import { ICategoryRepository } from './domain/interfaces/category-repository.interface.js';
import { CreateCategoryUseCase } from './use-cases/create-category.use-case.js';
import { DeleteCategoryUseCase } from './use-cases/delete-category.use-case.js';
import { GetCategoriesUseCase } from './use-cases/get-categories.use-case.js';
import { UpdateCategoryUseCase } from './use-cases/update-category.use-case.js';

@Module({
  controllers: [CategoryController],
  providers: [
    { provide: ICategoryRepository, useClass: CategoryRepository },
    GetCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  exports: [ICategoryRepository],
})
export class CategoryModule {}
