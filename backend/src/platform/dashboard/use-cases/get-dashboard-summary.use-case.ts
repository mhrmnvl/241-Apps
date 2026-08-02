import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../domain/interfaces/dashboard-repository.interface.js';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute() {
    const [
      totalStudents,
      totalTeachers,
      totalInstructors,
      totalClasses,
      totalSubjects,
      activeAcademicYear,
      institutionInfo,
      upcomingEvents,
      recentAnnouncements,
      studentDistribution,
      teacherDistribution,
      todayAttendance,
      pendingAdmissions,
    ] = await Promise.all([
      this.dashboardRepository.countActiveStudents(),
      this.dashboardRepository.countActiveTeachers(),
      this.dashboardRepository.countActiveInstructors(),
      this.dashboardRepository.countActiveClasses(),
      this.dashboardRepository.countActiveSubjects(),
      this.dashboardRepository.getActiveAcademicYear(),
      this.dashboardRepository.getInstitutionInfo(),
      this.dashboardRepository.getUpcomingCalendarEvents(5),
      this.dashboardRepository.getRecentAnnouncements(5),
      this.dashboardRepository.getStudentDistributionByGrade(),
      this.dashboardRepository.getTeacherDistributionByPosition(),
      this.dashboardRepository.countTodayAttendance(),
      this.dashboardRepository.countPendingAdmissions(),
    ]);

    const activeSemester = activeAcademicYear?.semesters?.[0] ?? null;

    return {
      statistics: {
        totalStudents,
        totalTeachers,
        totalInstructors,
        totalClasses,
        totalSubjects,
      },

      academicInfo: {
        activeAcademicYear: activeAcademicYear
          ? { id: activeAcademicYear.id, name: activeAcademicYear.name }
          : null,
        activeSemester: activeSemester
          ? {
              id: activeSemester.id,
              type: activeSemester.type?.name ?? null,
            }
          : null,
      },

      institution: institutionInfo
        ? {
            name: institutionInfo.name,
            status: institutionInfo.status,
            type: institutionInfo.type?.code ?? null,
          }
        : null,

      distributions: {
        studentsByGrade: studentDistribution,
        teachersByPosition: teacherDistribution,
      },

      todayAttendance,

      pendingAdmissions,

      upcomingEvents,

      recentAnnouncements,
    };
  }
}
