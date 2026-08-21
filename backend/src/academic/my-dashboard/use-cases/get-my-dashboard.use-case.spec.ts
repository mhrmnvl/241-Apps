import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicSettingRepository } from '../../academic-setting/domain/interfaces/academic-setting-repository.interface.js';
import { IStudentIdentityReadPort } from '../../student/domain/interfaces/student-identity-read.port.js';
import { ITeacherIdentityReadPort } from '../../teacher/domain/interfaces/teacher-identity-read.port.js';
import { IMyDashboardRepository } from '../domain/interfaces/my-dashboard-repository.interface.js';
import { GetMyDashboardUseCase } from './get-my-dashboard.use-case.js';

/**
 * What this guards is who the answer is about.
 *
 * The endpoint serves a student, a teacher, and the person who is both, and it
 * decides which from their records rather than from a role name — a school
 * invents roles, and a teacher given one of those still teaches. So the cases
 * below vary only the identity lookups and assert which half comes back.
 */
describe('GetMyDashboardUseCase', () => {
  let useCase: GetMyDashboardUseCase;

  const emptyRecap = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    sick: 0,
  };

  const repo = {
    findActiveSemester: jest.fn(),
    findEnrolledClassroom: jest.fn(),
    findClassroomLessons: jest.fn(),
    summariseAttendance: jest.fn(),
    findLatestScores: jest.fn(),
    findLatestPublishedReportCard: jest.fn(),
    findTeachingLessons: jest.fn(),
    summariseTeachingLoad: jest.fn(),
    findSupervisedClassrooms: jest.fn(),
    findUngradedAssessments: jest.fn(),
  };
  const studentIdentity = { findStudentIdByUserId: jest.fn() };
  const teacherIdentity = { findTeacherIdByUserId: jest.fn() };
  const academicSetting = { find: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyDashboardUseCase,
        { provide: IMyDashboardRepository, useValue: repo },
        { provide: IStudentIdentityReadPort, useValue: studentIdentity },
        { provide: ITeacherIdentityReadPort, useValue: teacherIdentity },
        { provide: IAcademicSettingRepository, useValue: academicSetting },
      ],
    }).compile();

    useCase = module.get(GetMyDashboardUseCase);
    jest.clearAllMocks();

    repo.findActiveSemester.mockResolvedValue({
      id: 'sem-1',
      name: 'Ganjil',
      academicYearId: 'ay-1',
    });
    repo.findEnrolledClassroom.mockResolvedValue({
      enrollmentId: 'enr-1',
      classroom: { id: 'cls-1', code: 'VIII-A', name: null },
    });
    repo.findClassroomLessons.mockResolvedValue([]);
    repo.summariseAttendance.mockResolvedValue(emptyRecap);
    repo.findLatestScores.mockResolvedValue([]);
    repo.findLatestPublishedReportCard.mockResolvedValue(null);
    repo.findTeachingLessons.mockResolvedValue([]);
    repo.summariseTeachingLoad.mockResolvedValue({
      classroomCount: 4,
      subjectCount: 2,
    });
    repo.findSupervisedClassrooms.mockResolvedValue([]);
    repo.findUngradedAssessments.mockResolvedValue({ rows: [], total: 0 });
    academicSetting.find.mockResolvedValue({ weeklyHolidays: [0] });
  });

  it('answers with neither half for someone who is neither', async () => {
    studentIdentity.findStudentIdByUserId.mockResolvedValue(null);
    teacherIdentity.findTeacherIdByUserId.mockResolvedValue(null);

    const result = await useCase.execute('user-admin');

    expect(result.student).toBeNull();
    expect(result.teacher).toBeNull();
    // Not an error: an administrator has a dashboard of its own, and this
    // endpoint simply has nothing personal to say about them.
    expect(repo.findEnrolledClassroom).not.toHaveBeenCalled();
    expect(repo.summariseTeachingLoad).not.toHaveBeenCalled();
  });

  it('answers only about the student when the caller only studies', async () => {
    studentIdentity.findStudentIdByUserId.mockResolvedValue('stu-1');
    teacherIdentity.findTeacherIdByUserId.mockResolvedValue(null);

    const result = await useCase.execute('user-student');

    expect(result.student?.classroom?.code).toBe('VIII-A');
    expect(result.teacher).toBeNull();
    expect(repo.summariseTeachingLoad).not.toHaveBeenCalled();
  });

  it('answers both halves for someone who teaches and also studies', async () => {
    studentIdentity.findStudentIdByUserId.mockResolvedValue('stu-1');
    teacherIdentity.findTeacherIdByUserId.mockResolvedValue('tch-1');

    const result = await useCase.execute('user-both');

    expect(result.student).not.toBeNull();
    expect(result.teacher?.load.classroomCount).toBe(4);
  });

  it('reads every query against the resolved ids, never the user id', async () => {
    studentIdentity.findStudentIdByUserId.mockResolvedValue('stu-1');
    teacherIdentity.findTeacherIdByUserId.mockResolvedValue('tch-1');

    await useCase.execute('user-both');

    expect(repo.findEnrolledClassroom).toHaveBeenCalledWith('stu-1', 'sem-1');
    expect(repo.summariseTeachingLoad).toHaveBeenCalledWith('tch-1', 'sem-1');
    expect(repo.summariseAttendance).toHaveBeenCalledWith('enr-1');
  });

  it('still answers between years, when no semester is active', async () => {
    studentIdentity.findStudentIdByUserId.mockResolvedValue('stu-1');
    teacherIdentity.findTeacherIdByUserId.mockResolvedValue(null);
    repo.findActiveSemester.mockResolvedValue(null);

    const result = await useCase.execute('user-student');

    expect(result.semester).toBeNull();
    expect(result.student?.classroom).toBeNull();
    expect(result.student?.attendance).toEqual(emptyRecap);
  });
});
