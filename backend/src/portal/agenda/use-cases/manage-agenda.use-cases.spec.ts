import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { IAgendaRepository } from '../domain/interfaces/agenda-repository.interface.js';
import {
  CreateAgendaUseCase,
  DeleteAgendaUseCase,
  PublishAgendaUseCase,
  RestoreAgendaUseCase,
  UpdateAgendaUseCase,
} from './manage-agenda.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const START = '2026-12-20T01:00:00.000Z';
const END = '2026-12-20T05:00:00.000Z';

function entry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agenda-1',
    title: 'Pentas Seni Akhir Tahun',
    slug: 'pentas-seni-akhir-tahun',
    description: '<p>Acara</p>',
    startTime: new Date(START),
    endTime: new Date(END),
    location: 'Aula MTs Persis 241',
    coverFileId: null,
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    authorId: AUTHOR_ID,
    version: 2,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
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
  findPublicBySlug: jest.fn(),
  findUpcoming: jest.fn(),
  findTakenSlugs: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  archive: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findAllVisible: jest.fn(),
};

const syncMediaUsage = { execute: jest.fn() };

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      HtmlSanitizerService,
      { provide: IAgendaRepository, useValue: repository },
      { provide: SyncMediaUsageUseCase, useValue: syncMediaUsage },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findById.mockResolvedValue(entry());
  repository.findTakenSlugs.mockResolvedValue([]);
  repository.create.mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(entry(data)),
  );
  repository.update.mockResolvedValue(entry({ version: 3 }));
  repository.publish.mockResolvedValue(
    entry({ status: ContentStatus.PUBLISHED, version: 3 }),
  );
  repository.restore.mockResolvedValue(entry({ deletedAt: null }));
  syncMediaUsage.execute.mockResolvedValue(undefined);
});

describe('CreateAgendaUseCase', () => {
  it('creates a draft with a derived address', async () => {
    const useCase = await build(CreateAgendaUseCase);

    await useCase.execute(
      {
        title: 'Pentas Seni Akhir Tahun',
        description: '<p>Acara</p>',
        startTime: START,
        endTime: END,
        location: 'Aula',
      },
      AUTHOR_ID,
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'pentas-seni-akhir-tahun' }),
    );
  });

  // FR-042. An entry that ends before it starts orders nonsensically in the
  // listing, which is how the school discovers it — long after it was entered.
  it('refuses an entry that ends before it starts', async () => {
    const useCase = await build(CreateAgendaUseCase);

    await expect(
      useCase.execute(
        {
          title: 'Salah',
          description: '<p>x</p>',
          startTime: END,
          endTime: START,
          location: 'Aula',
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuses a zero-length entry', async () => {
    const useCase = await build(CreateAgendaUseCase);

    await expect(
      useCase.execute(
        {
          title: 'Nol',
          description: '<p>x</p>',
          startTime: START,
          endTime: START,
          location: 'Aula',
        },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('sanitizes the description on write', async () => {
    const useCase = await build(CreateAgendaUseCase);

    await useCase.execute(
      {
        title: 'Acara',
        description: '<p>Isi</p><script>alert(1)</script>',
        startTime: START,
        endTime: END,
        location: 'Aula',
      },
      AUTHOR_ID,
    );

    const created = repository.create.mock.calls[0][0] as {
      description: string;
    };
    expect(created.description).not.toContain('<script>');
  });
});

describe('UpdateAgendaUseCase', () => {
  /**
   * Validated against the merged result rather than the payload: moving only
   * the end time can still produce an invalid range against the stored start,
   * and checking the payload alone would let it through.
   */
  it('refuses an end time that falls before the stored start time', async () => {
    const useCase = await build(UpdateAgendaUseCase);

    await expect(
      useCase.execute('agenda-1', {
        version: 2,
        endTime: '2026-12-19T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts moving only the start time when the range stays valid', async () => {
    const useCase = await build(UpdateAgendaUseCase);

    await useCase.execute('agenda-1', {
      version: 2,
      startTime: '2026-12-20T00:00:00.000Z',
    });

    expect(repository.update).toHaveBeenCalled();
  });

  it('refuses when someone else saved first', async () => {
    const useCase = await build(UpdateAgendaUseCase);
    repository.update.mockResolvedValue(null);

    await expect(
      useCase.execute('agenda-1', { version: 1, title: 'X' }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('PublishAgendaUseCase', () => {
  it('publishes now when no schedule is given', async () => {
    const useCase = await build(PublishAgendaUseCase);

    await useCase.execute('agenda-1', { version: 2 });

    const [, , status] = repository.publish.mock.calls[0] as [
      string,
      number,
      string,
    ];
    expect(status).toBe(ContentStatus.PUBLISHED);
  });

  it('schedules with a future moment', async () => {
    const useCase = await build(PublishAgendaUseCase);

    await useCase.execute('agenda-1', {
      version: 2,
      scheduledAt: '2030-01-01T00:00:00.000Z',
    });

    const [, , status] = repository.publish.mock.calls[0] as [
      string,
      number,
      string,
    ];
    expect(status).toBe(ContentStatus.SCHEDULED);
  });

  it('refuses a schedule in the past', async () => {
    const useCase = await build(PublishAgendaUseCase);

    await expect(
      useCase.execute('agenda-1', {
        version: 2,
        scheduledAt: '2020-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('DeleteAgendaUseCase', () => {
  it('soft deletes', async () => {
    const useCase = await build(DeleteAgendaUseCase);

    await useCase.execute('agenda-1');

    expect(repository.softDelete).toHaveBeenCalledWith('agenda-1');
  });
});

describe('RestoreAgendaUseCase', () => {
  it('restores a deleted entry', async () => {
    const useCase = await build(RestoreAgendaUseCase);
    repository.findById.mockResolvedValue(entry({ deletedAt: new Date() }));

    const result = await useCase.execute('agenda-1');

    expect(result.deletedAt).toBeNull();
  });

  it('refuses one that was never deleted', async () => {
    const useCase = await build(RestoreAgendaUseCase);

    await expect(useCase.execute('agenda-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(RestoreAgendaUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('agenda-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
