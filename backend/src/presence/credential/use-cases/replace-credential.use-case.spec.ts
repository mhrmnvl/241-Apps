import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { CredentialCodeService } from '../services/credential-code.service.js';
import { ReplaceCredentialUseCase } from './replace-credential.use-case.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const ISSUER_ID = '22222222-2222-4222-8222-222222222222';

const ACTIVE_CARD = {
  id: 'cred-1',
  userId: USER_ID,
  subjectType: 'STUDENT',
  status: 'ACTIVE',
};

describe('ReplaceCredentialUseCase', () => {
  let useCase: ReplaceCredentialUseCase;
  const repository = { findById: jest.fn(), replace: jest.fn() };
  const codes = { generate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReplaceCredentialUseCase,
        { provide: ICredentialRepository, useValue: repository },
        { provide: CredentialCodeService, useValue: codes },
      ],
    }).compile();

    useCase = module.get(ReplaceCredentialUseCase);
    jest.clearAllMocks();
    repository.findById.mockResolvedValue(ACTIVE_CARD);
    codes.generate.mockReturnValue('new-code');
  });

  it('issues a new code and revokes the old card in one call', async () => {
    await useCase.execute('cred-1', { reason: 'Kartu hilang' }, ISSUER_ID);

    expect(repository.replace).toHaveBeenCalledWith({
      previousId: 'cred-1',
      userId: USER_ID,
      subjectType: 'STUDENT',
      code: 'new-code',
      issuedBy: ISSUER_ID,
      revokedAt: expect.any(Date),
      revokedReason: 'Kartu hilang',
    });
  });

  // FR-002: the replacement belongs to the same person, so attendance history
  // stays continuous and the expected-days window has no gap.
  it('carries the holder and subject type across from the old card', async () => {
    repository.findById.mockResolvedValue({
      ...ACTIVE_CARD,
      subjectType: 'EMPLOYEE',
    });

    await useCase.execute('cred-1', { reason: 'Rusak' }, ISSUER_ID);

    expect(repository.replace).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID, subjectType: 'EMPLOYEE' }),
    );
  });

  it('never reuses the old code', async () => {
    await useCase.execute('cred-1', { reason: 'Kartu hilang' }, ISSUER_ID);

    expect(codes.generate).toHaveBeenCalledTimes(1);
    expect(repository.replace).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'new-code' }),
    );
  });

  it('refuses an unknown card', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { reason: 'x' }, ISSUER_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it('refuses to replace an already-revoked card', async () => {
    repository.findById.mockResolvedValue({
      ...ACTIVE_CARD,
      status: 'REVOKED',
    });

    await expect(
      useCase.execute('cred-1', { reason: 'x' }, ISSUER_ID),
    ).rejects.toThrow(ConflictException);
    expect(repository.replace).not.toHaveBeenCalled();
  });
});
