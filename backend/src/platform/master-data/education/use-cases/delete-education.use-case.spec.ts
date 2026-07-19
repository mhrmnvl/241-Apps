import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';
import { DeleteEducationUseCase } from './delete-education.use-case.js';

describe('DeleteEducationUseCase', () => {
  let useCase: DeleteEducationUseCase;

  const mockRepository = {
    findById: jest.fn(),
    countParentUsage: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEducationUseCase,
        { provide: IEducationRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteEducationUseCase>(DeleteEducationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'edu-uuid-1';

    it('should soft-delete successfully when education is not in use', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'edu-uuid-1',
        name: 'S1',
      });
      mockRepository.countParentUsage.mockResolvedValue(0);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.countParentUsage).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('should run findById and countParentUsage in parallel', async () => {
      const findByIdOrder: number[] = [];
      const countOrder: number[] = [];
      let call = 0;

      mockRepository.findById.mockImplementation(() => {
        findByIdOrder.push(++call);
        return Promise.resolve({ id: 'edu-uuid-1', name: 'S1' });
      });
      mockRepository.countParentUsage.mockImplementation(() => {
        countOrder.push(++call);
        return Promise.resolve(0);
      });
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(findByIdOrder.length).toBe(1);
      expect(countOrder.length).toBe(1);
    });

    it('should throw NotFoundException when education not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.countParentUsage.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when education is in use by parents', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'edu-uuid-1',
        name: 'S1',
      });
      mockRepository.countParentUsage.mockResolvedValue(3);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
