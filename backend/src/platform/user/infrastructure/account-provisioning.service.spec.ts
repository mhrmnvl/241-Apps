import { Prisma, UserGender } from '@prisma/client';
import {
  AccountProvisioningService,
  ProvisionAccountInput,
} from './account-provisioning.service.js';

describe('AccountProvisioningService', () => {
  let service: AccountProvisioningService;

  const input: ProvisionAccountInput = {
    identifier: 'guru001',
    passwordHash: 'hashed',
    roleCode: 'TEACHER',
    profile: {
      name: 'Budi Santoso',
      nik: '3578010101700001',
      gender: UserGender.MALE,
      birthPlace: 'Surabaya',
      birthDate: new Date('1980-06-15'),
    },
  };

  function makeTx(role: { id: string } | null) {
    const tx = {
      user: { create: jest.fn().mockResolvedValue({ id: 'u-1' }) },
      role: { findUnique: jest.fn().mockResolvedValue(role) },
      userRole: { create: jest.fn().mockResolvedValue({}) },
    };
    return tx as unknown as Prisma.TransactionClient & typeof tx;
  }

  beforeEach(() => {
    service = new AccountProvisioningService();
  });

  it('creates the user with nested profile and assigns the role', async () => {
    const tx = makeTx({ id: 'r-1' });

    const user = await service.provision(tx, input);

    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        identifier: 'guru001',
        passwordHash: 'hashed',
        profile: { create: input.profile },
      },
    });
    expect(tx.role.findUnique).toHaveBeenCalledWith({
      where: { code: 'TEACHER' },
    });
    expect(tx.userRole.create).toHaveBeenCalledWith({
      data: { userId: 'u-1', roleId: 'r-1' },
    });
    expect(user).toEqual({ id: 'u-1' });
  });

  it('skips role assignment when the role code is not found', async () => {
    const tx = makeTx(null);

    await service.provision(tx, input);

    expect(tx.userRole.create).not.toHaveBeenCalled();
  });

  it('skips the role lookup entirely when no role code is given', async () => {
    const tx = makeTx({ id: 'r-1' });

    await service.provision(tx, { ...input, roleCode: undefined });

    expect(tx.role.findUnique).not.toHaveBeenCalled();
    expect(tx.userRole.create).not.toHaveBeenCalled();
  });

  it('creates the account without a profile when none is given', async () => {
    const tx = makeTx({ id: 'r-1' });

    await service.provision(tx, {
      identifier: 'applicant01',
      passwordHash: 'hashed',
      roleCode: 'APPLICANT',
    });

    expect(tx.user.create).toHaveBeenCalledWith({
      data: { identifier: 'applicant01', passwordHash: 'hashed' },
    });
  });
});
