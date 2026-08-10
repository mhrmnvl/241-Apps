import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { RevokeCredentialUseCase } from './revoke-credential.use-case.js';

describe('RevokeCredentialUseCase', () => {
  let useCase: RevokeCredentialUseCase;
  const repository = { findById: jest.fn(), revoke: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeCredentialUseCase,
        { provide: ICredentialRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(RevokeCredentialUseCase);
    jest.clearAllMocks();
    repository.findById.mockResolvedValue({ id: 'cred-1', status: 'ACTIVE' });
  });

  it('revokes with the stated reason and a timestamp', async () => {
    await useCase.execute('cred-1', { reason: 'Kartu hilang' });

    expect(repository.revoke).toHaveBeenCalledWith('cred-1', {
      revokedAt: expect.any(Date),
      revokedReason: 'Kartu hilang',
    });
  });

  it('refuses an unknown card', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { reason: 'Kartu hilang' }),
    ).rejects.toThrow(NotFoundException);
  });

  // Re-revoking would overwrite the original reason and timestamp, losing why
  // and when the card actually stopped being valid.
  it('refuses a card that is already revoked', async () => {
    repository.findById.mockResolvedValue({ id: 'cred-1', status: 'REVOKED' });

    await expect(
      useCase.execute('cred-1', { reason: 'again' }),
    ).rejects.toThrow(ConflictException);
    expect(repository.revoke).not.toHaveBeenCalled();
  });

  it('refuses a card that was already replaced', async () => {
    repository.findById.mockResolvedValue({ id: 'cred-1', status: 'REPLACED' });

    await expect(
      useCase.execute('cred-1', { reason: 'again' }),
    ).rejects.toThrow(ConflictException);
  });
});
