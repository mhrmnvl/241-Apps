import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentQueryDto } from '../dto/student-parent-query.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { GetStudentParentsListUseCase } from './get-student-parents-list.use-case.js';

describe('GetStudentParentsListUseCase', () => {
  let useCase: GetStudentParentsListUseCase;

  const mockStudentParentsRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentParentsListUseCase,
        {
          provide: StudentParentRepository,
          useValue: mockStudentParentsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetStudentParentsListUseCase>(
      GetStudentParentsListUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated data with meta', async () => {
      const query: StudentParentQueryDto = { page: 1, limit: 10 };
      mockStudentParentsRepository.findAll.mockResolvedValue({
        data: [{ id: '1' }],
        total: 15,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
    });
  });
});
