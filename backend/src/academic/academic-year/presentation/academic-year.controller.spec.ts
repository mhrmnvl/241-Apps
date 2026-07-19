import { Test, TestingModule } from '@nestjs/testing';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto.js';
import { AcademicYearQueryDto } from '../dto/academic-year-query.dto.js';
import { CreateAcademicYearUseCase } from '../use-cases/create-academic-year.use-case.js';
import { DeleteAcademicYearUseCase } from '../use-cases/delete-academic-year.use-case.js';
import { GetAcademicYearByIdUseCase } from '../use-cases/get-academic-year-by-id.use-case.js';
import { GetAcademicYearsUseCase } from '../use-cases/get-academic-years.use-case.js';
import { UpdateAcademicYearUseCase } from '../use-cases/update-academic-year.use-case.js';
import { ActivateAcademicYearUseCase } from '../use-cases/activate-academic-year.use-case.js';
import { DeactivateAcademicYearUseCase } from '../use-cases/deactivate-academic-year.use-case.js';
import { AcademicYearController } from './academic-year.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('AcademicYearController', () => {
  let controller: AcademicYearController;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid-1',
  };

  const mockGetAcademicYearsService = { execute: jest.fn() };
  const mockGetAcademicYearByIdService = { execute: jest.fn() };
  const mockCreateAcademicYearService = { execute: jest.fn() };
  const mockUpdateAcademicYearService = { execute: jest.fn() };
  const mockDeleteAcademicYearService = { execute: jest.fn() };
  const mockActivateAcademicYearService = { execute: jest.fn() };
  const mockDeactivateAcademicYearService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicYearController],
      providers: [
        {
          provide: GetAcademicYearsUseCase,
          useValue: mockGetAcademicYearsService,
        },
        {
          provide: GetAcademicYearByIdUseCase,
          useValue: mockGetAcademicYearByIdService,
        },
        {
          provide: CreateAcademicYearUseCase,
          useValue: mockCreateAcademicYearService,
        },
        {
          provide: UpdateAcademicYearUseCase,
          useValue: mockUpdateAcademicYearService,
        },
        {
          provide: DeleteAcademicYearUseCase,
          useValue: mockDeleteAcademicYearService,
        },
        {
          provide: ActivateAcademicYearUseCase,
          useValue: mockActivateAcademicYearService,
        },
        {
          provide: DeactivateAcademicYearUseCase,
          useValue: mockDeactivateAcademicYearService,
        },
      ],
    }).compile();

    controller = module.get<AcademicYearController>(AcademicYearController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAcademicYearsUseCase with query', async () => {
      const query: AcademicYearQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'ay-1', name: '2024/2025', isActive: true }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetAcademicYearsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser, query);

      expect(mockGetAcademicYearsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetAcademicYearByIdUseCase with id', async () => {
      const id = 'ay-1';
      const expected = { id: 'ay-1', name: '2024/2025', isActive: true };
      mockGetAcademicYearByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(mockUser, id);

      expect(mockGetAcademicYearByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateAcademicYearUseCase with dto', async () => {
      const dto: CreateAcademicYearDto = { name: '2025/2026' };
      const expected = { id: 'ay-new', name: '2025/2026', isActive: false };
      mockCreateAcademicYearService.execute.mockResolvedValue(expected);

      const result = await controller.create(mockUser, dto);

      expect(mockCreateAcademicYearService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAcademicYearUseCase with id and dto', async () => {
      const id = 'ay-1';
      const dto: UpdateAcademicYearDto = { name: 'Updated 2025/2026' };
      const expected = {
        id: 'ay-1',
        name: 'Updated 2025/2026',
        isActive: false,
      };
      mockUpdateAcademicYearService.execute.mockResolvedValue(expected);

      const result = await controller.update(mockUser, id, dto);

      expect(mockUpdateAcademicYearService.execute).toHaveBeenCalledWith(
        id,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAcademicYearUseCase with id', async () => {
      const id = 'ay-1';
      mockDeleteAcademicYearService.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, id);

      expect(mockDeleteAcademicYearService.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('activate', () => {
    it('should delegate to ActivateAcademicYearUseCase with id', async () => {
      const id = 'ay-1';
      const expected = { id: 'ay-1', name: '2024/2025', isActive: true };
      mockActivateAcademicYearService.execute.mockResolvedValue(expected);

      const result = await controller.activate(mockUser, id);

      expect(mockActivateAcademicYearService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('deactivate', () => {
    it('should delegate to DeactivateAcademicYearUseCase with id', async () => {
      const id = 'ay-1';
      const expected = { id: 'ay-1', name: '2024/2025', isActive: false };
      mockDeactivateAcademicYearService.execute.mockResolvedValue(expected);

      const result = await controller.deactivate(mockUser, id);

      expect(mockDeactivateAcademicYearService.execute).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(expected);
    });
  });
});
