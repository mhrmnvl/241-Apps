import { Test, TestingModule } from '@nestjs/testing';
import { CreateParentDto } from '../dto/create-parent.dto.js';
import { ParentQueryDto } from '../dto/parent-query.dto.js';
import { UpdateParentDto } from '../dto/update-parent.dto.js';
import { CreateParentUseCase } from '../use-cases/create-parent.use-case.js';
import { DeleteParentUseCase } from '../use-cases/delete-parent.use-case.js';
import { GetParentByIdUseCase } from '../use-cases/get-parent-by-id.use-case.js';
import { GetParentsUseCase } from '../use-cases/get-parents.use-case.js';
import { UpdateParentUseCase } from '../use-cases/update-parent.use-case.js';
import { ParentController } from './parent.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('ParentController', () => {
  let controller: ParentController;

  const mockGetParentsService = { execute: jest.fn() };
  const mockGetParentByIdService = { execute: jest.fn() };
  const mockCreateParentService = { execute: jest.fn() };
  const mockUpdateParentService = { execute: jest.fn() };
  const mockDeleteParentService = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentController],
      providers: [
        { provide: GetParentsUseCase, useValue: mockGetParentsService },
        { provide: GetParentByIdUseCase, useValue: mockGetParentByIdService },
        { provide: CreateParentUseCase, useValue: mockCreateParentService },
        { provide: UpdateParentUseCase, useValue: mockUpdateParentService },
        { provide: DeleteParentUseCase, useValue: mockDeleteParentService },
      ],
    }).compile();

    controller = module.get<ParentController>(ParentController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetParentsUseCase with query', async () => {
      const query: ParentQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'par-1', name: 'Budi Santoso' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetParentsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser, query);

      expect(mockGetParentsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetParentByIdUseCase with id', async () => {
      const id = 'par-1';
      const expected = { id: 'par-1', name: 'Budi Santoso' };
      mockGetParentByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(mockUser, id);

      expect(mockGetParentByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateParentUseCase with dto', async () => {
      const dto: CreateParentDto = {
        name: 'Budi Santoso',
        nik: '3578010101700001',
        birthPlace: 'Surabaya',
        birthDate: '1970-01-01',
        occupationId: '550e8400-e29b-41d4-a716-446655440012',
      };
      const expected = { id: 'par-new', ...dto };
      mockCreateParentService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateParentService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateParentUseCase with id and dto', async () => {
      const id = 'par-1';
      const dto: UpdateParentDto = { name: 'Budi Updated' };
      const expected = { id: 'par-1', name: 'Budi Updated' };
      mockUpdateParentService.execute.mockResolvedValue(expected);

      const result = await controller.update(mockUser, id, dto);

      expect(mockUpdateParentService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteParentUseCase with id', async () => {
      const id = 'par-1';
      mockDeleteParentService.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, id);

      expect(mockDeleteParentService.execute).toHaveBeenCalledWith(id);
    });
  });
});
