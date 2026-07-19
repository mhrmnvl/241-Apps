import { Test, TestingModule } from '@nestjs/testing';
import { CreateEducationDto } from '../dto/create-education.dto.js';
import { EducationQueryDto } from '../dto/education-query.dto.js';
import { UpdateEducationDto } from '../dto/update-education.dto.js';
import { CreateEducationUseCase } from '../use-cases/create-education.use-case.js';
import { DeleteEducationUseCase } from '../use-cases/delete-education.use-case.js';
import { GetEducationByIdUseCase } from '../use-cases/get-education-by-id.use-case.js';
import { GetEducationsUseCase } from '../use-cases/get-educations.use-case.js';
import { UpdateEducationUseCase } from '../use-cases/update-education.use-case.js';
import { EducationController } from './education.controller.js';

describe('EducationController', () => {
  let controller: EducationController;

  const mockGetEducationsService = { execute: jest.fn() };
  const mockGetEducationByIdService = { execute: jest.fn() };
  const mockCreateEducationService = { execute: jest.fn() };
  const mockUpdateEducationService = { execute: jest.fn() };
  const mockDeleteEducationService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationController],
      providers: [
        { provide: GetEducationsUseCase, useValue: mockGetEducationsService },
        {
          provide: GetEducationByIdUseCase,
          useValue: mockGetEducationByIdService,
        },
        {
          provide: CreateEducationUseCase,
          useValue: mockCreateEducationService,
        },
        {
          provide: UpdateEducationUseCase,
          useValue: mockUpdateEducationService,
        },
        {
          provide: DeleteEducationUseCase,
          useValue: mockDeleteEducationService,
        },
      ],
    }).compile();

    controller = module.get<EducationController>(EducationController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetEducationsUseCase with query', async () => {
      const query: EducationQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'edu-uuid-1', name: 'S1' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetEducationsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetEducationsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetEducationByIdUseCase with id', async () => {
      const id = 'edu-uuid-1';
      const expected = { id: 'edu-uuid-1', name: 'S1', isActive: true };
      mockGetEducationByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetEducationByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateEducationUseCase with dto', async () => {
      const dto: CreateEducationDto = { name: 'S1' };
      const expected = { id: 'edu-uuid-new', name: 'S1', isActive: true };
      mockCreateEducationService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateEducationService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateEducationUseCase with id and dto', async () => {
      const id = 'edu-uuid-1';
      const dto: UpdateEducationDto = { name: 'S2' };
      const expected = { id: 'edu-uuid-1', name: 'S2' };
      mockUpdateEducationService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdateEducationService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteEducationUseCase with id', async () => {
      const id = 'edu-uuid-1';
      mockDeleteEducationService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteEducationService.execute).toHaveBeenCalledWith(id);
    });
  });
});
