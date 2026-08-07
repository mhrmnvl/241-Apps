import { Module } from '@nestjs/common';
import { ICategoryRepository } from './domain/interfaces/category-repository.interface.js';
import { ITagRepository } from './domain/interfaces/tag-repository.interface.js';
import { PrismaCategoryRepository } from './infrastructure/persistence/prisma-category.repository.js';
import { PrismaTagRepository } from './infrastructure/persistence/prisma-tag.repository.js';
import {
  CategoryController,
  CategoryPublicController,
} from './presentation/category.controller.js';
import {
  TagController,
  TagPublicController,
} from './presentation/tag.controller.js';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetPublicCategoriesUseCase,
  UpdateCategoryUseCase,
} from './use-cases/manage-category.use-cases.js';
import {
  CreateTagUseCase,
  DeleteTagUseCase,
  GetTagsUseCase,
  UpdateTagUseCase,
} from './use-cases/manage-tag.use-cases.js';

@Module({
  controllers: [
    CategoryController,
    CategoryPublicController,
    TagController,
    TagPublicController,
  ],
  providers: [
    { provide: ICategoryRepository, useClass: PrismaCategoryRepository },
    { provide: ITagRepository, useClass: PrismaTagRepository },

    GetCategoriesUseCase,
    GetPublicCategoriesUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,

    GetTagsUseCase,
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
  ],
  // Exported so the post module can attach tags through the port rather than
  // writing portal_post_tags itself (Principle VI).
  exports: [ICategoryRepository, ITagRepository],
})
export class TaxonomyModule {}
