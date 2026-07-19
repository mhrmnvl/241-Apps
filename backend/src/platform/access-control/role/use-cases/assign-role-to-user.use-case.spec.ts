import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AssignRoleToUserUseCase } from './assign-role-to-user.use-case.js';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';
import { IUserRepository } from '../../../user/index.js';

describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase;
  let rolesRepo: jest.Mocked<IRoleRepository>;
  let usersRepo: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRolesRepo = {
      findById: jest.fn(),
      findUserRoles: jest.fn(),
      findUserRole: jest.fn(),
      assignRoleToUser: jest.fn(),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleToUserUseCase,
        { provide: IRoleRepository, useValue: mockRolesRepo },
        { provide: IUserRepository, useValue: mockUsersRepo },
      ],
    }).compile();

    useCase = module.get<AssignRoleToUserUseCase>(AssignRoleToUserUseCase);
    rolesRepo = module.get(IRoleRepository);
    usersRepo = module.get(IUserRepository);
  });

  it('should throw NotFoundException when role is not found', async () => {
    rolesRepo.findUserRoles.mockResolvedValue([]);
    rolesRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('role-1', 'user-1', 'requester-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not found', async () => {
    rolesRepo.findUserRoles.mockResolvedValue([]);
    rolesRepo.findById.mockResolvedValue({
      id: 'role-1',
      code: 'ADMIN',
    } as any);
    usersRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('role-1', 'user-1', 'requester-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should successfully assign role', async () => {
    rolesRepo.findUserRoles.mockResolvedValue([]);
    rolesRepo.findById.mockResolvedValue({
      id: 'role-1',
      code: 'ADMIN',
    } as any);
    usersRepo.findById.mockResolvedValue({ id: 'user-1' } as any);
    rolesRepo.findUserRole.mockResolvedValue(null);
    rolesRepo.assignRoleToUser.mockResolvedValue({} as any);

    await expect(
      useCase.execute('role-1', 'user-1', 'requester-1'),
    ).resolves.not.toThrow();

    expect(rolesRepo.assignRoleToUser).toHaveBeenCalledWith('user-1', 'role-1');
  });

  it('should throw ConflictException if user already has the role', async () => {
    rolesRepo.findUserRoles.mockResolvedValue([]);
    rolesRepo.findById.mockResolvedValue({
      id: 'role-1',
      code: 'ADMIN',
    } as any);
    usersRepo.findById.mockResolvedValue({ id: 'user-1' } as any);
    rolesRepo.findUserRole.mockResolvedValue({} as any);

    await expect(
      useCase.execute('role-1', 'user-1', 'requester-1'),
    ).rejects.toThrow(ConflictException);
  });
});
