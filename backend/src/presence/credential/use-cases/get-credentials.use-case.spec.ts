import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import {
  GetCredentialByIdUseCase,
  GetCredentialsUseCase,
} from './get-credentials.use-case.js';

function card(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cred-1',
    userId: 'user-1',
    subjectType: 'STUDENT',
    status: 'ACTIVE',
    issuedAt: new Date('2026-08-01T00:00:00.000Z'),
    holder: {
      id: 'user-1',
      identifier: '2024001',
      displayName: 'Ahmad Fauzi',
      photoUrl: null,
    },
    ...overrides,
  };
}

describe('GetCredentialsUseCase', () => {
  let list: GetCredentialsUseCase;
  let byId: GetCredentialByIdUseCase;
  const repository = { findAll: jest.fn(), findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCredentialsUseCase,
        GetCredentialByIdUseCase,
        { provide: ICredentialRepository, useValue: repository },
      ],
    }).compile();

    list = module.get(GetCredentialsUseCase);
    byId = module.get(GetCredentialByIdUseCase);
    jest.clearAllMocks();
    repository.findAll.mockResolvedValue({
      data: [card()],
      total: 25,
      page: 2,
      limit: 10,
    });
    repository.findById.mockResolvedValue(card());
  });

  it('folds the repository result into the pagination envelope', async () => {
    await expect(list.execute({ page: 2, limit: 10 })).resolves.toEqual({
      data: [card()],
      meta: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });
  });

  // The card code is what makes a card usable. A list screen left open on a
  // shared TU machine must not be a way to copy one.
  it('never exposes the card code in a list row', async () => {
    const result = await list.execute({});

    expect(result.data[0]).not.toHaveProperty('code');
  });

  it('never exposes the card code in a detail response', async () => {
    await expect(byId.execute('cred-1')).resolves.not.toHaveProperty('code');
  });

  it('raises NotFound for an unknown id', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(byId.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
