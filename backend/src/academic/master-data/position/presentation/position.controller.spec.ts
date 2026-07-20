import { Test, TestingModule } from '@nestjs/testing';
import { CreatePositionDto } from '../dto/request/create-position.dto.js';
import { PositionQueryDto } from '../dto/request/position-query.dto.js';
import { UpdatePositionDto } from '../dto/request/update-position.dto.js';
import { CreatePositionUseCase } from '../use-cases/create-position.use-case.js';
import { DeletePositionUseCase } from '../use-cases/delete-position.use-case.js';
import { GetPositionByIdUseCase } from '../use-cases/get-position-by-id.use-case.js';
import { GetPositionsUseCase } from '../use-cases/get-positions.use-case.js';
import { UpdatePositionUseCase } from '../use-cases/update-position.use-case.js';
import { PositionController } from './position.controller.js';

describe('PositionController', () => {
  let controller: PositionController;

  const mockGetPositionsService = { execute: jest.fn() };
  const mockGetPositionByIdService = { execute: jest.fn() };
  const mockCreatePositionService = { execute: jest.fn() };
  const mockUpdatePositionService = { execute: jest.fn() };
  const mockDeletePositionService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionController],
      providers: [
        { provide: GetPositionsUseCase, useValue: mockGetPositionsService },
        {
          provide: GetPositionByIdUseCase,
          useValue: mockGetPositionByIdService,
        },
        { provide: CreatePositionUseCase, useValue: mockCreatePositionService },
        { provide: UpdatePositionUseCase, useValue: mockUpdatePositionService },
        { provide: DeletePositionUseCase, useValue: mockDeletePositionService },
      ],
    }).compile();

    controller = module.get<PositionController>(PositionController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetPositionsUseCase with query', async () => {
      const query: PositionQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [
          {
            id: 'pos-1',
            name: 'Kepala Sekolah',
            category: { id: 'cat-1', code: 'MANAGEMENT', name: 'Management' },
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetPositionsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetPositionsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetPositionByIdUseCase with id', async () => {
      const id = 'pos-1';
      const expected = { id: 'pos-1', name: 'Kepala Sekolah' };
      mockGetPositionByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetPositionByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreatePositionUseCase with dto', async () => {
      const dto: CreatePositionDto = {
        name: 'Wali Kelas',
        categoryId: 'cat-2',
      };
      const expected = { id: 'pos-new', ...dto };
      mockCreatePositionService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreatePositionService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdatePositionUseCase with id and dto', async () => {
      const id = 'pos-1';
      const dto: UpdatePositionDto = { name: 'Kepala Sekolah Updated' };
      const expected = { id: 'pos-1', name: 'Kepala Sekolah Updated' };
      mockUpdatePositionService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdatePositionService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeletePositionUseCase with id', async () => {
      const id = 'pos-1';
      mockDeletePositionService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeletePositionService.execute).toHaveBeenCalledWith(id);
    });
  });
});
