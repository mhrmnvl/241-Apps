import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';
import { GetClassroomLevelsUseCase } from './get-grades.use-case.js';

describe('GetClassroomLevelsUseCase', () => {
  let useCase: GetClassroomLevelsUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomLevelsUseCase,
        { provide: IClassroomLevelsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetClassroomLevelsUseCase>(GetClassroomLevelsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated classroom levels', async () => {
    const expected = {
      data: [
        { id: 'lvl-1', level: 7, name: 'VII', isActive: true },
        { id: 'lvl-2', level: 8, name: 'VIII', isActive: true },
      ],
      total: 2,
      page: 1,
      limit: 10,
    };
    mockRepository.findAll.mockResolvedValue(expected);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual(expected);
    expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
