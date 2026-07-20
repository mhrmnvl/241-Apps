import { Test, TestingModule } from '@nestjs/testing';
import { AcademicCalendarQueryDto } from '../dto/request/academic-calendar-query.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { GetAcademicCalendarsUseCase } from './get-academic-calendars.use-case.js';

describe('GetAcademicCalendarsUseCase', () => {
  let useCase: GetAcademicCalendarsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAcademicCalendarsUseCase,
        { provide: IAcademicCalendarRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetAcademicCalendarsUseCase>(
      GetAcademicCalendarsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated calendars', async () => {
      const query: AcademicCalendarQueryDto = {
        academicYearId: 'ay-uuid',
        page: 1,
        limit: 50,
      };
      const expected = {
        data: [{ id: 'cal-1' }],
        total: 1,
        page: 1,
        limit: 50,
      };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('should pass typeId filter correctly', async () => {
      const query: AcademicCalendarQueryDto = {
        typeId: 'calendar-type-uuid',
      };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });
  });
});
