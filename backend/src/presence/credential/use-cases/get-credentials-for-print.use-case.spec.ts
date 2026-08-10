import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICredentialRepository } from '../domain/interfaces/credential-repository.interface.js';
import { GetCredentialsForPrintUseCase } from './get-credentials-for-print.use-case.js';

describe('GetCredentialsForPrintUseCase', () => {
  let useCase: GetCredentialsForPrintUseCase;
  const repository = { findForPrint: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCredentialsForPrintUseCase,
        { provide: ICredentialRepository, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetCredentialsForPrintUseCase);
    jest.clearAllMocks();
    repository.findForPrint.mockResolvedValue([
      { id: 'cred-1', code: 'abc', holder: { displayName: 'Ahmad' } },
    ]);
  });

  it('returns the codes the sheet needs to render a QR', async () => {
    const result = await useCase.execute(['user-1']);

    expect(result[0]).toHaveProperty('code', 'abc');
  });

  // An empty list would otherwise mean "no filter" and return everything.
  it('refuses an empty selection', async () => {
    await expect(useCase.execute([])).rejects.toThrow(BadRequestException);
    expect(repository.findForPrint).not.toHaveBeenCalled();
  });

  it('caps a print run so the whole school cannot be dumped in one call', async () => {
    const tooMany = Array.from({ length: 201 }, (_, i) => `user-${i}`);

    await expect(useCase.execute(tooMany)).rejects.toThrow(/at most 200/);
  });

  it('allows a full class or staff list', async () => {
    const aClass = Array.from({ length: 40 }, (_, i) => `user-${i}`);

    await expect(useCase.execute(aClass)).resolves.toBeDefined();
  });
});
