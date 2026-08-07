import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ITagRepository } from '../domain/interfaces/tag-repository.interface.js';
import {
  CreateTagUseCase,
  DeleteTagUseCase,
  GetTagsUseCase,
  UpdateTagUseCase,
} from './manage-tag.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const tag = { id: 'tag-1', name: 'olimpiade', slug: 'olimpiade' };

const repository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  rename: jest.fn(),
  delete: jest.fn(),
  resolveOrCreate: jest.fn(),
  setPostTags: jest.fn(),
  findByPostId: jest.fn(),
};

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [useCase, { provide: ITagRepository, useValue: repository }],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findAll.mockResolvedValue([tag]);
  repository.findById.mockResolvedValue(tag);
  repository.findBySlug.mockResolvedValue(null);
  repository.create.mockResolvedValue(tag);
  repository.rename.mockResolvedValue({ ...tag, name: 'Olimpiade' });
});

describe('GetTagsUseCase', () => {
  it('passes the search term through for the type-ahead', async () => {
    const useCase = await build(GetTagsUseCase);

    await useCase.execute('olim');

    expect(repository.findAll).toHaveBeenCalledWith('olim');
  });
});

describe('CreateTagUseCase', () => {
  it('derives the address from the label', async () => {
    const useCase = await build(CreateTagUseCase);

    await useCase.execute({ name: 'Lomba Matematika' });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Lomba Matematika',
      slug: 'lomba-matematika',
    });
  });

  // Two labels differing only in case would otherwise split one filter in two.
  it('refuses one that already exists under the same address', async () => {
    const useCase = await build(CreateTagUseCase);
    repository.findBySlug.mockResolvedValue(tag);

    await expect(useCase.execute({ name: 'Olimpiade' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('refuses a label that produces no usable address', async () => {
    const useCase = await build(CreateTagUseCase);

    await expect(useCase.execute({ name: '###' })).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('UpdateTagUseCase', () => {
  // The slug is a public filter address that may already be shared, so fixing
  // the label's capitalisation must not break `/berita?tagSlug=olimpiade`.
  it('renames the label without moving the address', async () => {
    const useCase = await build(UpdateTagUseCase);

    const result = await useCase.execute('tag-1', { name: 'Olimpiade' });

    expect(repository.rename).toHaveBeenCalledWith('tag-1', 'Olimpiade');
    expect(result.slug).toBe('olimpiade');
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(UpdateTagUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tag-1', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('DeleteTagUseCase', () => {
  // No in-use guard, unlike a category: a tag is a label rather than a
  // classification, and removing it leaves every post exactly as it was.
  it('deletes without checking whether posts carry it', async () => {
    const useCase = await build(DeleteTagUseCase);

    await useCase.execute('tag-1');

    expect(repository.delete).toHaveBeenCalledWith('tag-1');
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(DeleteTagUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tag-1')).rejects.toThrow(NotFoundException);
  });
});
