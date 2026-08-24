import { ApiProperty } from '@nestjs/swagger';

/**
 * The institution dashboard, as it leaves the server.
 *
 * Transcribed from what `GetDashboardSummaryUseCase` returns rather than
 * designed here: every field below is one the use case already assembles, and
 * the flattening it does — a semester's type down to its name, a school unit's
 * type down to its code — is described as flattened rather than as the relation
 * it came from.
 */

export class DashboardStatisticsResponseDto {
  @ApiProperty({ example: 186 }) totalStudents!: number;
  @ApiProperty({ example: 21 }) totalTeachers!: number;
  @ApiProperty({ example: 4 }) totalInstructors!: number;
  @ApiProperty({ example: 6 }) totalClasses!: number;
  @ApiProperty({ example: 14 }) totalSubjects!: number;
}

export class DashboardAcademicYearRefDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: '2026/2027' }) name!: string;
}

export class DashboardSemesterRefDto {
  @ApiProperty({ format: 'uuid' }) id!: string;

  @ApiProperty({
    example: 'ODD',
    nullable: true,
    description: "Flattened from the semester type's name.",
  })
  type!: string | null;
}

export class DashboardAcademicInfoResponseDto {
  @ApiProperty({ type: () => DashboardAcademicYearRefDto, nullable: true })
  activeAcademicYear!: DashboardAcademicYearRefDto | null;

  @ApiProperty({
    type: () => DashboardSemesterRefDto,
    nullable: true,
    description:
      'The first semester of the active year, or null between years and ' +
      'while a newly activated year is still being set up.',
  })
  activeSemester!: DashboardSemesterRefDto | null;
}

export class DashboardInstitutionResponseDto {
  @ApiProperty({ example: 'MTs Persis 241 Al-Ikhlash' }) name!: string;
  @ApiProperty({ example: 'PRIVATE' }) status!: string;

  @ApiProperty({
    example: 'MTS',
    nullable: true,
    description: "Flattened from the school unit type's code.",
  })
  type!: string | null;
}

export class DashboardStudentsByGradeResponseDto {
  @ApiProperty({ example: 'VII' }) grade!: string;
  @ApiProperty({ example: 62 }) totalStudents!: number;
}

export class DashboardTeachersByPositionResponseDto {
  @ApiProperty({
    example: 'Guru Mata Pelajaran',
    required: false,
    description: 'Absent for teachers holding no position category.',
  })
  category?: string;

  @ApiProperty({ example: 12 }) total!: number;
}

export class DashboardDistributionsResponseDto {
  @ApiProperty({ type: () => [DashboardStudentsByGradeResponseDto] })
  studentsByGrade!: DashboardStudentsByGradeResponseDto[];

  @ApiProperty({ type: () => [DashboardTeachersByPositionResponseDto] })
  teachersByPosition!: DashboardTeachersByPositionResponseDto[];
}

export class DashboardTodayAttendanceResponseDto {
  @ApiProperty({ example: 178 }) present!: number;
  @ApiProperty({ example: 2 }) absent!: number;
  @ApiProperty({ example: 3 }) late!: number;
  @ApiProperty({ example: 1 }) excused!: number;
  @ApiProperty({ example: 2 }) sick!: number;
}

export class DashboardEventResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Ujian Tengah Semester' }) title!: string;

  @ApiProperty({
    example: 'Ujian',
    description: "Flattened from the calendar type's name.",
  })
  type!: string;

  @ApiProperty({ type: String, format: 'date-time' }) startDate!: Date;
  @ApiProperty({ type: String, format: 'date-time' }) endDate!: Date;
}

export class DashboardAnnouncementResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Libur Maulid Nabi' }) title!: string;
  @ApiProperty({ type: String, format: 'date-time' }) date!: Date;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ type: () => DashboardStatisticsResponseDto })
  statistics!: DashboardStatisticsResponseDto;

  @ApiProperty({ type: () => DashboardAcademicInfoResponseDto })
  academicInfo!: DashboardAcademicInfoResponseDto;

  @ApiProperty({
    type: () => DashboardInstitutionResponseDto,
    nullable: true,
    description: 'Null until the school profile has been set up.',
  })
  institution!: DashboardInstitutionResponseDto | null;

  @ApiProperty({ type: () => DashboardDistributionsResponseDto })
  distributions!: DashboardDistributionsResponseDto;

  @ApiProperty({ type: () => DashboardTodayAttendanceResponseDto })
  todayAttendance!: DashboardTodayAttendanceResponseDto;

  @ApiProperty({ example: 3 }) pendingAdmissions!: number;

  @ApiProperty({ type: () => [DashboardEventResponseDto] })
  upcomingEvents!: DashboardEventResponseDto[];

  @ApiProperty({ type: () => [DashboardAnnouncementResponseDto] })
  recentAnnouncements!: DashboardAnnouncementResponseDto[];
}
