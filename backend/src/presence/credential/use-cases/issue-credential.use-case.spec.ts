import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { CredentialCodeService } from '../services/credential-code.service.js';
import { IssueCredentialUseCase } from './issue-credential.use-case.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const ISSUER_ID = '22222222-2222-4222-8222-222222222222';

describe('IssueCredentialUseCase', () => {
  let useCase: IssueCredentialUseCase;
  const repository = {
    findActiveByUserId: jest.fn(),
    create: jest.fn(),
  };
  const codes = { generate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueCredentialUseCase,
        { provide: ICredentialRepository, useValue: repository },
        { provide: CredentialCodeService, useValue: codes },
      ],
    }).compile();

    useCase = module.get(IssueCredentialUseCase);
    jest.clearAllMocks();
    repository.findActiveByUserId.mockResolvedValue(null);
    repository.create.mockImplementation((input: unknown) => input);
    codes.generate.mockReturnValue('generated-code');
  });

  it('issues a card with a freshly generated code', async () => {
    await useCase.execute(
      { userId: USER_ID, subjectType: 'STUDENT' },
      ISSUER_ID,
    );

    expect(repository.create).toHaveBeenCalledWith({
      userId: USER_ID,
      subjectType: 'STUDENT',
      code: 'generated-code',
      issuedBy: ISSUER_ID,
    });
  });

  it('records who issued it', async () => {
    await useCase.execute(
      { userId: USER_ID, subjectType: 'EMPLOYEE' },
      ISSUER_ID,
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ issuedBy: ISSUER_ID }),
    );
  });

  // Two active cards for one person would make "which card is valid" ambiguous
  // at the gate and break the one-active-card partial unique index.
  it('refuses a second card while one is still active', async () => {
    repository.findActiveByUserId.mockResolvedValue({ id: 'existing' });

    await expect(
      useCase.execute({ userId: USER_ID, subjectType: 'STUDENT' }, ISSUER_ID),
    ).rejects.toThrow(ConflictException);

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('points the operator at replacement rather than just refusing', async () => {
    repository.findActiveByUserId.mockResolvedValue({ id: 'existing' });

    await expect(
      useCase.execute({ userId: USER_ID, subjectType: 'STUDENT' }, ISSUER_ID),
    ).rejects.toThrow(/Replace it/);
  });

  // A revoked card must not block reissuing — that is the lost-card path.
  it('issues when the person only holds revoked cards', async () => {
    repository.findActiveByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: USER_ID, subjectType: 'STUDENT' }, ISSUER_ID),
    ).resolves.toBeDefined();
  });
});
