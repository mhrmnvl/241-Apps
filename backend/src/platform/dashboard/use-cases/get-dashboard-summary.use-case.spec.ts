import { Test, TestingModule } from '@nestjs/testing';
import { IDashboardRepository } from '../domain/interfaces/dashboard-repository.interface.js';
import { GetDashboardSummaryUseCase } from './get-dashboard-summary.use-case.js';

describe('GetDashboardSummaryUseCase', () => {
  let useCase: GetDashboardSummaryUseCase;
  let repository: jest.Mocked<IDashboardRepository>;

  const mockRepository: Partial<Record<keyof IDashboardRepository, jest.Mock>> =
    {
      countActiveStudents: jest.fn(),
      countActiveTeachers: jest.fn(),
      countActiveInstructors: jest.fn(),
      countActiveClasses: jest.fn(),
      countActiveSubjects: jest.fn(),
      getActiveAcademicYear: jest.fn(),
      getInstitutionInfo: jest.fn(),
      getUpcomingCalendarEvents: jest.fn(),
      getRecentAnnouncements: jest.fn(),
      getStudentDistributionByGrade: jest.fn(),
      getTeacherDistributionByPosition: jest.fn(),
      countTodayAttendance: jest.fn(),
      countPendingAdmissions: jest.fn(),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDashboardSummaryUseCase,
        { provide: IDashboardRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetDashboardSummaryUseCase);
    repository = module.get(IDashboardRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return complete dashboard summary', async () => {
    repository.countActiveStudents.mockResolvedValue(120);
    repository.countActiveTeachers.mockResolvedValue(25);
    repository.countActiveInstructors.mockResolvedValue(18);
    repository.countActiveClasses.mockResolvedValue(9);
    repository.countActiveSubjects.mockResolvedValue(15);
    repository.getActiveAcademicYear.mockResolvedValue({
      id: 'ay-1',
      name: '2025/2026',
      semesters: [
        {
          id: 'sem-1',
          type: {
            id: 'type-odd',
            name: 'ODD',
            deletedAt: null,
            isActive: true,
          },
        },
      ],
    } as any);
    repository.getInstitutionInfo.mockResolvedValue({
      id: 'inst-1',
      name: 'MTs Al-Hikmah',
      status: 'PRIVATE',
      type: {
        id: 'type-1',
        code: 'MTS',
        name: 'Madrasah Tsanawiyah',
        isActive: true,
      },
    } as any);
    repository.getUpcomingCalendarEvents.mockResolvedValue([
      {
        id: 'ev-1',
        title: 'Libur Nasional',
        type: {
          id: 'type-uuid',
          name: 'Libur Nasional',
          isActive: true,
          deletedAt: null,
        },
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-01'),
      },
    ] as any);
    repository.getRecentAnnouncements.mockResolvedValue([
      { id: 'ann-1', title: 'Pengumuman UTS', date: new Date('2025-10-01') },
    ]);
    repository.getStudentDistributionByGrade.mockResolvedValue([
      { grade: 'GRADE_7', totalStudents: 40 },
      { grade: 'GRADE_8', totalStudents: 45 },
      { grade: 'GRADE_9', totalStudents: 35 },
    ]);
    repository.getTeacherDistributionByPosition.mockResolvedValue([
      { category: 'ACADEMIC', total: 18 },
      { category: 'ADMIN', total: 7 },
    ]);
    const result = await useCase.execute();

    expect(repository.countActiveStudents).toHaveBeenCalledWith();
    expect(repository.countActiveTeachers).toHaveBeenCalledWith();
    expect(repository.countActiveInstructors).toHaveBeenCalledWith();
    expect(repository.countActiveClasses).toHaveBeenCalledWith();
    expect(repository.countActiveSubjects).toHaveBeenCalledWith();
    expect(repository.getActiveAcademicYear).toHaveBeenCalledWith();
    expect(repository.getInstitutionInfo).toHaveBeenCalledWith();
    expect(repository.getUpcomingCalendarEvents).toHaveBeenCalledWith(5);
    expect(repository.getRecentAnnouncements).toHaveBeenCalledWith(5);
    expect(repository.getStudentDistributionByGrade).toHaveBeenCalledWith();
    expect(repository.getTeacherDistributionByPosition).toHaveBeenCalledWith();

    expect(result.statistics).toEqual({
      totalStudents: 120,
      totalTeachers: 25,
      totalInstructors: 18,
      totalClasses: 9,
      totalSubjects: 15,
    });

    expect(result.academicInfo.activeAcademicYear).toEqual({
      id: 'ay-1',
      name: '2025/2026',
    });
    expect(result.academicInfo.activeSemester).toEqual({
      id: 'sem-1',
      type: 'ODD',
    });

    expect(result.institution).toEqual({
      name: 'MTs Al-Hikmah',
      status: 'PRIVATE',
      type: 'MTS',
    });

    expect(result.upcomingEvents).toHaveLength(1);
    expect(result.recentAnnouncements).toHaveLength(1);
    expect(result.distributions.studentsByGrade).toHaveLength(3);
    expect(result.distributions.teachersByPosition).toHaveLength(2);
  });

  it('should handle null academic year gracefully', async () => {
    repository.countActiveStudents.mockResolvedValue(0);
    repository.countActiveTeachers.mockResolvedValue(0);
    repository.countActiveInstructors.mockResolvedValue(0);
    repository.countActiveClasses.mockResolvedValue(0);
    repository.countActiveSubjects.mockResolvedValue(0);
    repository.getActiveAcademicYear.mockResolvedValue(null);
    repository.getInstitutionInfo.mockResolvedValue(null);
    repository.getUpcomingCalendarEvents.mockResolvedValue([]);
    repository.getRecentAnnouncements.mockResolvedValue([]);
    repository.getStudentDistributionByGrade.mockResolvedValue([]);
    repository.getTeacherDistributionByPosition.mockResolvedValue([]);
    const result = await useCase.execute();

    expect(result.academicInfo.activeAcademicYear).toBeNull();
    expect(result.academicInfo.activeSemester).toBeNull();
    expect(result.institution).toBeNull();
    expect(result.statistics.totalStudents).toBe(0);
  });

  it('should handle academic year with no active semester', async () => {
    repository.countActiveStudents.mockResolvedValue(10);
    repository.countActiveTeachers.mockResolvedValue(5);
    repository.countActiveInstructors.mockResolvedValue(3);
    repository.countActiveClasses.mockResolvedValue(2);
    repository.countActiveSubjects.mockResolvedValue(8);
    repository.getActiveAcademicYear.mockResolvedValue({
      id: 'ay-2',
      name: '2024/2025',
      semesters: [],
    });
    repository.getInstitutionInfo.mockResolvedValue(null);
    repository.getUpcomingCalendarEvents.mockResolvedValue([]);
    repository.getRecentAnnouncements.mockResolvedValue([]);
    repository.getStudentDistributionByGrade.mockResolvedValue([]);
    repository.getTeacherDistributionByPosition.mockResolvedValue([]);
    const result = await useCase.execute();

    expect(result.academicInfo.activeAcademicYear).toEqual({
      id: 'ay-2',
      name: '2024/2025',
    });
    expect(result.academicInfo.activeSemester).toBeNull();
  });
});
