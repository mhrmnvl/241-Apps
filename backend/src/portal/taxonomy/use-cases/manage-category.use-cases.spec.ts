import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICategoryRepository } from '../domain/interfaces/category-repository.interface.js';
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetPublicCategoriesUseCase,
  UpdateCategoryUseCase,
} from './manage-category.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const category = {
  id: 'cat-1',
  name: 'Prestasi',
  slug: 'prestasi',
  description: null,
  isActive: true,
  displayOrder: 1,
};

const repository = {
  findAll: jest.fn(),
  findAllActive: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findActiveWithPublishedCounts: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findUsage: jest.fn(),
  softDelete: jest.fn(),
};

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      { provide: ICategoryRepository, useValue: repository },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findById.mockResolvedValue(category);
  repository.findBySlug.mockResolvedValue(null);
  repository.create.mockResolvedValue(category);
  repository.update.mockResolvedValue(category);
  repository.findUsage.mockResolvedValue({ count: 0, sampleTitles: [] });
});

describe('GetCategoriesUseCase', () => {
  // Management sees deactivated categories, which is what makes them
  // reactivatable — only the public filter bar hides them (FR-036).
  it('includes deactivated categories by default', async () => {
    const useCase = await build(GetCategoriesUseCase);
    repository.findAll.mockResolvedValue([category]);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.findAllActive).not.toHaveBeenCalled();
  });

  it('can narrow to active ones for the editor form', async () => {
    const useCase = await build(GetCategoriesUseCase);
    repository.findAllActive.mockResolvedValue([category]);

    await useCase.execute(true);

    expect(repository.findAllActive).toHaveBeenCalled();
  });
});

describe('GetPublicCategoriesUseCase', () => {
  it('returns categories with their published counts, for the filter bar', async () => {
    const useCase = await build(GetPublicCategoriesUseCase);
    repository.findActiveWithPublishedCounts.mockResolvedValue([
      { ...category, publishedCount: 4 },
    ]);

    const [item] = await useCase.execute();

    expect(item.publishedCount).toBe(4);
  });
});

describe('CreateCategoryUseCase', () => {
  it('derives the address from the name', async () => {
    const useCase = await build(CreateCategoryUseCase);

    await useCase.execute({ name: 'Kegiatan Sekolah' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'kegiatan-sekolah' }),
    );
  });

  // Refused rather than suffixed, unlike a post: a duplicate category is almost
  // always someone recreating one that exists, and "prestasi-2" would leave two
  // categories nobody meant to have.
  it('refuses a duplicate rather than quietly suffixing it', async () => {
    const useCase = await build(CreateCategoryUseCase);
    repository.findBySlug.mockResolvedValue(category);

    await expect(useCase.execute({ name: 'Prestasi' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('refuses a name that produces no usable address', async () => {
    const useCase = await build(CreateCategoryUseCase);

    await expect(useCase.execute({ name: '!!!' })).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('UpdateCategoryUseCase', () => {
  // `/berita?categorySlug=prestasi` may already be shared, so fixing a typo in
  // the label must not move the address.
  it('renaming does not move the public address', async () => {
    const useCase = await build(UpdateCategoryUseCase);

    await useCase.execute('cat-1', { name: 'Prestasi Siswa' });

    expect(repository.update).toHaveBeenCalledWith('cat-1', {
      name: 'Prestasi Siswa',
    });
  });

  it('moves the address only when asked explicitly', async () => {
    const useCase = await build(UpdateCategoryUseCase);

    await useCase.execute('cat-1', { slug: 'prestasi-siswa' });

    expect(repository.update).toHaveBeenCalledWith('cat-1', {
      slug: 'prestasi-siswa',
    });
  });

  it('refuses to move onto an address another category holds', async () => {
    const useCase = await build(UpdateCategoryUseCase);
    repository.findBySlug.mockResolvedValue({ ...category, id: 'cat-2' });

    await expect(
      useCase.execute('cat-1', { slug: 'kegiatan' }),
    ).rejects.toThrow(ConflictException);
  });

  it('deactivates without touching the content filed under it', async () => {
    const useCase = await build(UpdateCategoryUseCase);

    await useCase.execute('cat-1', { isActive: false });

    expect(repository.update).toHaveBeenCalledWith('cat-1', {
      isActive: false,
    });
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(UpdateCategoryUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('cat-1', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('DeleteCategoryUseCase', () => {
  it('deletes one nothing references', async () => {
    const useCase = await build(DeleteCategoryUseCase);

    await useCase.execute('cat-1');

    expect(repository.softDelete).toHaveBeenCalledWith('cat-1');
  });

  // FR-037: the refusal names the count and some titles. "In use" on its own
  // leaves the editor hunting through hundreds of items for the ones in the way.
  it('refuses while posts still point at it, naming what is in the way', async () => {
    const useCase = await build(DeleteCategoryUseCase);
    repository.findUsage.mockResolvedValue({
      count: 3,
      sampleTitles: ['Juara 1 Olimpiade', 'Lomba Cerdas Cermat'],
    });

    await expect(useCase.execute('cat-1')).rejects.toMatchObject({
      response: {
        count: 3,
        sampleTitles: ['Juara 1 Olimpiade', 'Lomba Cerdas Cermat'],
      },
    });
    expect(repository.softDelete).not.toHaveBeenCalled();
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(DeleteCategoryUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('cat-1')).rejects.toThrow(NotFoundException);
  });
});
