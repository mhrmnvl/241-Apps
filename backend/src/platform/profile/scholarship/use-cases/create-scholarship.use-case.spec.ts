import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipStatus } from '../../../../shared/domain/enums/scholarship-status.enum.js';
import { CreateScholarshipDto } from '../dto/request/create-scholarship.dto.js';
import { IScholarshipRepository } from '../domain/interfaces/scholarship-repository.interface.js';
import { CreateScholarshipUseCase } from './create-scholarship.use-case.js';

describe('CreateScholarshipUseCase', () => {
  let useCase: CreateScholarshipUseCase;

  const mockRepo = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateScholarshipUseCase,
        { provide: IScholarshipRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateScholarshipUseCase>(CreateScholarshipUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateScholarshipDto = {
      profileId: 'profile-uuid',
      name: 'Beasiswa Prestasi',
      provider: 'Kemendikbud',
      year: 2024,
      status: ScholarshipStatus.ACTIVE,
    };

    it('should create scholarship and return result', async () => {
      const created = { id: 'sch-1', ...dto };
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
