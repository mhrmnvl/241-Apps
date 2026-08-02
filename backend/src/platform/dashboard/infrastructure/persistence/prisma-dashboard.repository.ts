import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IDashboardRepository } from '../../domain/interfaces/dashboard-repository.interface.js';

@Injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countActiveStudents(): Promise<number> {
    const activeSemester = await this.prisma.semester.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        academicYear: { isActive: true, deletedAt: null },
      },
      select: { id: true },
    });

    if (!activeSemester) return 0;

    return this.prisma.studentEnrollment.count({
      where: {
        semesterId: activeSemester.id,
        status: 'ACTIVE',
        deletedAt: null,
        student: { status: 'ACTIVE', deletedAt: null },
      },
    });
  }

  async countActiveTeachers(): Promise<number> {
    return this.prisma.teacher.count({
      where: {
        deletedAt: null,
        user: { isActive: true, deletedAt: null },
      },
    });
  }

  async countActiveClasses(): Promise<number> {
    return this.prisma.classroom.count({
      where: {
        isActive: true,
        deletedAt: null,
        academicYear: { deletedAt: null },
      },
    });
  }

  async countActiveSubjects(): Promise<number> {
    return this.prisma.subject.count({
      where: { deletedAt: null },
    });
  }

  async countActiveInstructors(): Promise<number> {
    return this.prisma.teacher.count({
      where: {
        deletedAt: null,
        user: { isActive: true, deletedAt: null },
        teachingAssignments: { some: { deletedAt: null } },
      },
    });
  }

  async getActiveAcademicYear() {
    return this.prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        semesters: {
          where: { isActive: true, deletedAt: null },
          select: { id: true, type: true },
          take: 1,
        },
      },
    });
  }

  async getUpcomingCalendarEvents(limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await this.prisma.academicCalendar.findMany({
      where: {
        deletedAt: null,
        endDate: { gte: today },
      },
      select: {
        id: true,
        title: true,
        type: { select: { name: true } },
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type.name,
      startDate: r.startDate,
      endDate: r.endDate,
    }));
  }

  async getRecentAnnouncements(limit: number) {
    return this.prisma.announcement.findMany({
      where: {
        deletedAt: null,
        classrooms: {
          some: {
            classroom: {
              academicYear: { deletedAt: null },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getStudentDistributionByGrade() {
    const results = await this.prisma.classroom.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        academicYear: { isActive: true, deletedAt: null },
      },
      select: {
        grade: { select: { name: true, level: true } },
        _count: {
          select: {
            enrollments: {
              where: { deletedAt: null, status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { grade: { level: 'asc' } },
    });

    const grouped = new Map<string, number>();
    for (const classroom of results) {
      const grade = classroom.grade.name;
      const current = grouped.get(grade) ?? 0;
      grouped.set(grade, current + classroom._count.enrollments);
    }

    return Array.from(grouped.entries()).map(([grade, totalStudents]) => ({
      grade,
      totalStudents,
    }));
  }

  async getTeacherDistributionByPosition() {
    const results = await this.prisma.position.groupBy({
      by: ['categoryId'],
      where: {
        isActive: true,
        deletedAt: null,
        teacherPositions: {
          some: {
            deletedAt: null,
            isPrimary: true,
            teacher: { deletedAt: null },
          },
        },
      },
      _count: { _all: true },
    });

    const categoryIds = results.map((r) => r.categoryId);
    const categories = await this.prisma.positionCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, code: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.code]));

    return results.map((r) => ({
      category: categoryMap.get(r.categoryId),
      total: r._count._all,
    }));
  }

  async getInstitutionInfo() {
    return this.prisma.schoolUnit.findFirst({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        type: true,
      },
    });
  }

  async countTodayAttendance(): Promise<{
    present: number;
    absent: number;
    late: number;
    excused: number;
    sick: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rows = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        date: { gte: today, lt: tomorrow },
      },
      _count: { _all: true },
    });

    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.status] = row._count._all;
    }

    return {
      present: map.PRESENT ?? 0,
      absent: map.ABSENT ?? 0,
      late: map.LATE ?? 0,
      excused: map.EXCUSED ?? 0,
      sick: map.SICK ?? 0,
    };
  }

  async countPendingAdmissions(): Promise<number> {
    return this.prisma.admissionApplication.count({
      where: {
        status: { in: ['SUBMITTED', 'REVISION_NEEDED', 'VERIFIED'] },
      },
    });
  }
}
