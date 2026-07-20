import { Test, TestingModule } from '@nestjs/testing';
import { CreateOccupationDto } from '../dto/request/create-occupation.dto.js';
import { OccupationQueryDto } from '../dto/request/occupation-query.dto.js';
import { UpdateOccupationDto } from '../dto/request/update-occupation.dto.js';
import { CreateOccupationUseCase } from '../use-cases/create-occupation.use-case.js';
import { DeleteOccupationUseCase } from '../use-cases/delete-occupation.use-case.js';
import { GetOccupationByIdUseCase } from '../use-cases/get-occupation-by-id.use-case.js';
import { GetOccupationsUseCase } from '../use-cases/get-occupations.use-case.js';
import { UpdateOccupationUseCase } from '../use-cases/update-occupation.use-case.js';
import { OccupationController } from './occupation.controller.js';

describe('OccupationController', () => {
  let controller: OccupationController;

  const mockGetOccupationsService = { execute: jest.fn() };
  const mockGetOccupationByIdService = { execute: jest.fn() };
  const mockCreateOccupationService = { execute: jest.fn() };
  const mockUpdateOccupationService = { execute: jest.fn() };
  const mockDeleteOccupationService = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupationController],
      providers: [
        { provide: GetOccupationsUseCase, useValue: mockGetOccupationsService },
        {
          provide: GetOccupationByIdUseCase,
          useValue: mockGetOccupationByIdService,
        },
        {
          provide: CreateOccupationUseCase,
          useValue: mockCreateOccupationService,
        },
        {
          provide: UpdateOccupationUseCase,
          useValue: mockUpdateOccupationService,
        },
        {
          provide: DeleteOccupationUseCase,
          useValue: mockDeleteOccupationService,
        },
      ],
    }).compile();

    controller = module.get<OccupationController>(OccupationController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetOccupationsUseCase with query', async () => {
      const query: OccupationQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'occ-1', name: 'Wiraswasta' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetOccupationsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetOccupationsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetOccupationByIdUseCase with id', async () => {
      const id = 'occ-1';
      const expected = { id: 'occ-1', name: 'Wiraswasta' };
      mockGetOccupationByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetOccupationByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateOccupationUseCase with dto', async () => {
      const dto: CreateOccupationDto = { name: 'Wiraswasta' };
      const expected = { id: 'occ-new', ...dto };
      mockCreateOccupationService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateOccupationService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateOccupationUseCase with id and dto', async () => {
      const id = 'occ-1';
      const dto: UpdateOccupationDto = { name: 'PNS' };
      const expected = { id: 'occ-1', name: 'PNS' };
      mockUpdateOccupationService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdateOccupationService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteOccupationUseCase with id', async () => {
      const id = 'occ-1';
      mockDeleteOccupationService.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteOccupationService.execute).toHaveBeenCalledWith(id);
    });
  });
});
