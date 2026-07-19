import { Test, TestingModule } from '@nestjs/testing';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto.js';
import { UpdateScholarshipDto } from '../dto/update-scholarship.dto.js';
import { CreateScholarshipUseCase } from '../use-cases/create-scholarship.use-case.js';
import { GetScholarshipsUseCase } from '../use-cases/get-scholarships.use-case.js';
import { GetScholarshipByIdUseCase } from '../use-cases/get-scholarship-by-id.use-case.js';
import { UpdateScholarshipUseCase } from '../use-cases/update-scholarship.use-case.js';
import { DeleteScholarshipUseCase } from '../use-cases/delete-scholarship.use-case.js';
import { ScholarshipController } from './scholarship.controller.js';

describe('ScholarshipController', () => {
  let controller: ScholarshipController;

  const mockCreate = { execute: jest.fn() };
  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScholarshipController],
      providers: [
        { provide: CreateScholarshipUseCase, useValue: mockCreate },
        { provide: GetScholarshipsUseCase, useValue: mockGetAll },
        { provide: GetScholarshipByIdUseCase, useValue: mockGetById },
        { provide: UpdateScholarshipUseCase, useValue: mockUpdate },
        { provide: DeleteScholarshipUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<ScholarshipController>(ScholarshipController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetScholarshipsUseCase', async () => {
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(mockGetAll.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetScholarshipByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'sch-1' });
      const result = await controller.findOne('sch-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('sch-1');
      expect(result).toEqual({ id: 'sch-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateScholarshipUseCase', async () => {
      const dto: CreateScholarshipDto = {
        profileId: 'prof-1',
        name: 'Beasiswa Prestasi',
        provider: 'Kemendikbud',
        year: 2024,
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateScholarshipUseCase', async () => {
      const dto: UpdateScholarshipDto = { name: 'Updated' };
      mockUpdate.execute.mockResolvedValue({ id: 'sch-1' });
      await controller.update('sch-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('sch-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteScholarshipUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('sch-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('sch-1');
    });
  });
});
