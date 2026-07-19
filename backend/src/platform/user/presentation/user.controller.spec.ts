import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dto/request/create-user.request.dto.js';
import { UpdateUserDto } from '../dto/request/update-user.request.dto.js';
import { UserQueryDto } from '../dto/request/user-query.request.dto.js';
import { CreateUserUseCase } from '../use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../use-cases/get-user-by-id.use-case.js';
import { GetUsersUseCase } from '../use-cases/get-users.use-case.js';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case.js';
import { UserController } from './user.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('UserController', () => {
  let controller: UserController;

  const mockGetUsersUseCase = { execute: jest.fn() };
  const mockGetUserByIdUseCase = { execute: jest.fn() };
  const mockCreateUserUseCase = { execute: jest.fn() };
  const mockUpdateUserUseCase = { execute: jest.fn() };
  const mockDeleteUserUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: GetUsersUseCase, useValue: mockGetUsersUseCase },
        { provide: GetUserByIdUseCase, useValue: mockGetUserByIdUseCase },
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: DeleteUserUseCase, useValue: mockDeleteUserUseCase },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to CreateUserUseCase with dto', async () => {
      const dto: CreateUserDto = {
        identifier: 'newuser',
        password: 'pass123',
      };
      const expected = { id: 'user-1', identifier: 'newuser' };
      mockCreateUserUseCase.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should delegate to GetUsersUseCase with query', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockGetUsersUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetUsersUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetUserByIdUseCase when requester is self', async () => {
      const id = 'user-1';
      const requester = { id: 'user-1' };
      mockGetUserByIdUseCase.execute.mockResolvedValue({
        id,
      });

      await controller.findOne(id, requester as unknown as AuthenticatedUser);

      expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith(id);
    });

    it('should throw ForbiddenException when user accesses another user', async () => {
      const requester = { id: 'user-other' };
      mockGetUserByIdUseCase.execute.mockResolvedValue({
        id: 'user-1',
      });

      await expect(
        controller.findOne('user-1', requester as unknown as AuthenticatedUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateUserUseCase when requester is self', async () => {
      const id = 'user-1';
      const dto: UpdateUserDto = { identifier: 'updated' };
      const requester = { id: 'user-1' };
      const expected = { id, identifier: 'updated' };
      mockGetUserByIdUseCase.execute.mockResolvedValue({
        id,
      });
      mockUpdateUserUseCase.execute.mockResolvedValue(expected);

      const result = await controller.update(
        id,
        dto,
        requester as unknown as AuthenticatedUser,
      );

      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });

    it('should throw ForbiddenException when user updates another user', async () => {
      const dto: UpdateUserDto = { identifier: 'hacked' };
      const requester = { id: 'user-other' };
      mockGetUserByIdUseCase.execute.mockResolvedValue({
        id: 'user-1',
      });

      await expect(
        controller.update(
          'user-1',
          dto,
          requester as unknown as AuthenticatedUser,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUpdateUserUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteUserUseCase with id', async () => {
      const id = 'user-1';
      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(id);
    });
  });
});
