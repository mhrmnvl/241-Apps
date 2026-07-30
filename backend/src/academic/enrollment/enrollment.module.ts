import { Module, forwardRef } from '@nestjs/common';
import { SemesterModule } from '../semester/semester.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { StudentModule } from '../student/student.module.js';
import { EnrollmentController } from './presentation/enrollment.controller.js';
import { PrismaEnrollmentRepository } from './infrastructure/persistence/prisma-enrollment.repository.js';
import { BulkCreateStudentEnrollmentUseCase } from './use-cases/bulk-create-student-enrollment.use-case.js';
import { CreateStudentEnrollmentUseCase } from './use-cases/create-student-enrollment.use-case.js';
import { DeleteStudentEnrollmentUseCase } from './use-cases/delete-student-enrollment.use-case.js';
import { DropStudentUseCase } from './use-cases/drop-student.use-case.js';
import { GetStudentEnrollmentByIdUseCase } from './use-cases/get-student-enrollment-by-id.use-case.js';
import { GetStudentEnrollmentsUseCase } from './use-cases/get-student-enrollments.use-case.js';
import { TransferStudentUseCase } from './use-cases/transfer-student.use-case.js';
import { BulkTransferStudentUseCase } from './use-cases/bulk-transfer-student.use-case.js';
import { UpdateStudentEnrollmentUseCase } from './use-cases/update-student-enrollment.use-case.js';
import { EnsureStudentEnrollmentUseCase } from './use-cases/ensure-student-enrollment.use-case.js';
import { IEnrollmentRepository } from './domain/interfaces/enrollment-repository.interface.js';

@Module({
  imports: [SemesterModule, ClassroomModule, forwardRef(() => StudentModule)],
  controllers: [EnrollmentController],
  providers: [
    {
      provide: IEnrollmentRepository,
      useClass: PrismaEnrollmentRepository,
    },
    GetStudentEnrollmentsUseCase,
    GetStudentEnrollmentByIdUseCase,
    CreateStudentEnrollmentUseCase,
    BulkCreateStudentEnrollmentUseCase,
    UpdateStudentEnrollmentUseCase,
    DeleteStudentEnrollmentUseCase,
    TransferStudentUseCase,
    BulkTransferStudentUseCase,
    DropStudentUseCase,
    EnsureStudentEnrollmentUseCase,
  ],
  exports: [IEnrollmentRepository, EnsureStudentEnrollmentUseCase],
})
export class EnrollmentModule {}
