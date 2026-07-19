import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';
import { GetEducationByIdUseCase } from './get-education-by-id.use-case.js';

describe('GetEducationByIdUseCase', () => {
  let useCase: GetEducationByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEducationByIdUseCase,
        { provide: IEducationRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetEducationByIdUseCase>(GetEducationByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'edu-uuid-1';

    it('should return an education level when found', async () => {
      const mockEducation = { id: 'edu-uuid-1', name: 'S1', isActive: true };
      mockRepository.findById.mockResolvedValue(mockEducation);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEducation);
    });

    it('should throw NotFoundException when education not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
