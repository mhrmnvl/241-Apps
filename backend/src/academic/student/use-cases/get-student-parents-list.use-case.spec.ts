import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentQueryDto } from '../dto/request/student-parent-query.dto.js';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
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
          provide: IStudentParentRepository,
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
      // findAll returns the full list; the use case paginates in memory.
      mockStudentParentsRepository.findAll.mockResolvedValue(
        Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1) })),
      );

      const result = await useCase.execute(query);

      expect(result.data).toHaveLength(10);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
    });
  });
});
