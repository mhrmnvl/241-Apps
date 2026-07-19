import { Test, TestingModule } from '@nestjs/testing';
import { CurriculaQueryDto } from '../dto/curriculum-query.dto.js';
import { CreateCurriculaDto } from '../dto/create-curriculum.dto.js';
import { UpdateCurriculaDto } from '../dto/update-curriculum.dto.js';
import { CreateCurriculaUseCase } from '../use-cases/create-curriculum.use-case.js';
import { DeleteCurriculaUseCase } from '../use-cases/delete-curriculum.use-case.js';
import { GetCurriculaByIdUseCase } from '../use-cases/get-curricula-by-id.use-case.js';
import { GetCurriculaUseCase } from '../use-cases/get-curricula.use-case.js';
import { UpdateCurriculaUseCase } from '../use-cases/update-curriculum.use-case.js';
import { CurriculumController } from './curriculum.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('CurriculumController', () => {
  let controller: CurriculumController;

  const mockGetCurriculaService = { execute: jest.fn() };
  const mockGetCurriculaByIdService = { execute: jest.fn() };
  const mockCreateCurriculaService = { execute: jest.fn() };
  const mockUpdateCurriculaService = { execute: jest.fn() };
  const mockDeleteCurriculaService = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurriculumController],
      providers: [
        { provide: GetCurriculaUseCase, useValue: mockGetCurriculaService },
        {
          provide: GetCurriculaByIdUseCase,
          useValue: mockGetCurriculaByIdService,
        },
        {
          provide: CreateCurriculaUseCase,
          useValue: mockCreateCurriculaService,
        },
        {
          provide: UpdateCurriculaUseCase,
          useValue: mockUpdateCurriculaService,
        },
        {
          provide: DeleteCurriculaUseCase,
          useValue: mockDeleteCurriculaService,
        },
      ],
    }).compile();

    controller = module.get<CurriculumController>(CurriculumController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetCurriculaUseCase with query', async () => {
      const query: CurriculaQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'curr-uuid-1', name: 'Kurikulum Merdeka' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetCurriculaService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser, query);

      expect(mockGetCurriculaService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetCurriculaByIdUseCase with id', async () => {
      const id = 'curr-uuid-1';
      const expected = {
        id: 'curr-uuid-1',
        name: 'Kurikulum Merdeka',
        academicYearId: '550e8400-e29b-41d4-a716-446655440009',
      };
      mockGetCurriculaByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(mockUser, id);

      expect(mockGetCurriculaByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateCurriculaUseCase', async () => {
      const dto: CreateCurriculaDto = {
        academicYearId: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Kurikulum Merdeka',
      };
      const expected = { id: 'curr-uuid-new', ...dto };
      mockCreateCurriculaService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto, mockUser);

      expect(mockCreateCurriculaService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateCurriculaUseCase with id and dto', async () => {
      const id = 'curr-uuid-1';
      const dto: UpdateCurriculaDto = { name: 'Kurikulum 2013' };
      const expected = { id: 'curr-uuid-1', name: 'Kurikulum 2013' };
      mockUpdateCurriculaService.execute.mockResolvedValue(expected);

      const result = await controller.update(mockUser, id, dto);

      expect(mockUpdateCurriculaService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteCurriculaUseCase with id', async () => {
      const id = 'curr-uuid-1';
      mockDeleteCurriculaService.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, id);

      expect(mockDeleteCurriculaService.execute).toHaveBeenCalledWith(id);
    });
  });
});
