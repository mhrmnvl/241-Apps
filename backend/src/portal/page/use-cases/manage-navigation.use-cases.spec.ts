import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INavigationRepository } from '../domain/interfaces/navigation-repository.interface.js';
import {
  CreateNavItemUseCase,
  DeleteNavItemUseCase,
  GetPublicNavigationUseCase,
  ReorderNavigationUseCase,
  UpdateNavItemUseCase,
} from './manage-navigation.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const PAGE_ID = '22222222-2222-4222-8222-222222222222';

function item(overrides: Record<string, unknown> = {}) {
  return {
    id: 'nav-1',
    label: 'Profil',
    pageId: PAGE_ID,
    routeKey: null,
    externalUrl: null,
    displayOrder: 0,
    isActive: true,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const repository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findPublic: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  reorder: jest.fn(),
  delete: jest.fn(),
};

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      { provide: INavigationRepository, useValue: repository },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findAll.mockResolvedValue([item()]);
  repository.findById.mockResolvedValue(item());
  repository.create.mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(item(data)),
  );
  repository.update.mockImplementation(
    (_id: string, data: Record<string, unknown>) => Promise.resolve(item(data)),
  );
});

describe('CreateNavItemUseCase', () => {
  it('creates an item pointing at a portal page', async () => {
    const useCase = await build(CreateNavItemUseCase);

    await useCase.execute({ label: 'Profil', pageId: PAGE_ID });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ pageId: PAGE_ID, routeKey: null }),
    );
  });

  it('creates an item pointing at a built-in listing', async () => {
    const useCase = await build(CreateNavItemUseCase);

    await useCase.execute({ label: 'Berita', routeKey: 'berita' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ routeKey: 'berita', pageId: null }),
    );
  });

  // FR-004: the portal links to PPDB rather than duplicating any of it.
  it('creates an item pointing outside the portal', async () => {
    const useCase = await build(CreateNavItemUseCase);

    await useCase.execute({
      label: 'PPDB',
      externalUrl: 'https://ppdb.example.sch.id',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ externalUrl: 'https://ppdb.example.sch.id' }),
    );
  });

  it('refuses an item with no destination', async () => {
    const useCase = await build(CreateNavItemUseCase);

    await expect(useCase.execute({ label: 'Kosong' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('refuses an item with more than one destination', async () => {
    const useCase = await build(CreateNavItemUseCase);

    await expect(
      useCase.execute({ label: 'Ambigu', pageId: PAGE_ID, routeKey: 'berita' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('UpdateNavItemUseCase', () => {
  it('renames without touching the destination', async () => {
    const useCase = await build(UpdateNavItemUseCase);

    await useCase.execute('nav-1', { label: 'Profil Madrasah' });

    expect(repository.update).toHaveBeenCalledWith(
      'nav-1',
      expect.objectContaining({ label: 'Profil Madrasah', pageId: PAGE_ID }),
    );
  });

  // Merging a new destination onto the old one would leave two set and fail
  // the check — switching has to clear the others.
  it('switching destination clears the previous one', async () => {
    const useCase = await build(UpdateNavItemUseCase);

    await useCase.execute('nav-1', { routeKey: 'berita' });

    expect(repository.update).toHaveBeenCalledWith(
      'nav-1',
      expect.objectContaining({ routeKey: 'berita', pageId: null }),
    );
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(UpdateNavItemUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nav-1', { label: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('ReorderNavigationUseCase', () => {
  it('applies the order it was given', async () => {
    const useCase = await build(ReorderNavigationUseCase);
    repository.findAll.mockResolvedValue([item(), item({ id: 'nav-2' })]);

    await useCase.execute({ itemIds: ['nav-2', 'nav-1'] });

    expect(repository.reorder).toHaveBeenCalledWith(['nav-2', 'nav-1']);
  });

  // A stale client list would otherwise reorder the menu around an item that
  // no longer exists, producing an order nobody chose.
  it('refuses an order containing an unknown item', async () => {
    const useCase = await build(ReorderNavigationUseCase);

    await expect(
      useCase.execute({ itemIds: ['nav-1', 'nav-sudah-dihapus'] }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.reorder).not.toHaveBeenCalled();
  });
});

describe('GetPublicNavigationUseCase', () => {
  /**
   * FR-053. The filtering lives in the repository query, so unpublishing a page
   * removes its menu entry on the next request — nobody has to remember to also
   * edit the menu, and the site never shows a link into a 404.
   */
  it('returns whatever the repository judged publicly linkable', async () => {
    const useCase = await build(GetPublicNavigationUseCase);
    repository.findPublic.mockResolvedValue([
      { id: 'nav-1', label: 'Profil', href: '/profil', isExternal: false },
    ]);

    const items = await useCase.execute();

    expect(items).toHaveLength(1);
    expect(repository.findPublic).toHaveBeenCalled();
  });
});

describe('DeleteNavItemUseCase', () => {
  it('deletes the entry and nothing else', async () => {
    const useCase = await build(DeleteNavItemUseCase);

    await useCase.execute('nav-1');

    expect(repository.delete).toHaveBeenCalledWith('nav-1');
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(DeleteNavItemUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nav-1')).rejects.toThrow(NotFoundException);
  });
});
