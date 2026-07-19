import { Module } from '@nestjs/common';
import { PositionCategoryController } from './presentation/position-category.controller.js';
import { PositionCategoryRepository } from './repositories/position-category.repository.js';
import { IPositionCategoryRepository } from './interfaces/position-category-repository.interface.js';
import { CreatePositionCategoryUseCase } from './use-cases/create-position-category.use-case.js';
import { GetPositionCategoriesUseCase } from './use-cases/get-position-categories.use-case.js';
import { GetPositionCategoryByIdUseCase } from './use-cases/get-position-category-by-id.use-case.js';
import { UpdatePositionCategoryUseCase } from './use-cases/update-position-category.use-case.js';
import { DeletePositionCategoryUseCase } from './use-cases/delete-position-category.use-case.js';

@Module({
  controllers: [PositionCategoryController],
  providers: [
    {
      provide: IPositionCategoryRepository,
      useClass: PositionCategoryRepository,
    },
    CreatePositionCategoryUseCase,
    GetPositionCategoriesUseCase,
    GetPositionCategoryByIdUseCase,
    UpdatePositionCategoryUseCase,
    DeletePositionCategoryUseCase,
  ],
  exports: [IPositionCategoryRepository],
})
export class PositionCategoryModule {}
