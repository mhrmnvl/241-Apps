import { Module } from '@nestjs/common';
import { UserModule } from '../../platform/user/index.js';
import { GradeModule } from '../grade/grade.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { StudentController } from './presentation/student.controller.js';
import { StudentAddressController } from './presentation/student-address.controller.js';
import { StudentParentController } from './presentation/student-parent.controller.js';
import { StudentProfileController } from './presentation/student-profile.controller.js';
import { StudentRepository } from './repositories/student.repository.js';
import { StudentAddressRepository } from './repositories/student-address.repository.js';
import { StudentParentRepository } from './repositories/student-parent.repository.js';
import { PrismaStudentRepository } from './infrastructure/persistence/prisma-student.repository.js';
import { PrismaStudentAddressRepository } from './infrastructure/persistence/prisma-student-address.repository.js';
import { PrismaStudentParentRepository } from './infrastructure/persistence/prisma-student-parent.repository.js';
import { ExcelStudentParser } from './infrastructure/parsers/excel-student.parser.js';
import { CreateStudentUseCase } from './use-cases/create-student.use-case.js';
import { DeleteStudentUseCase } from './use-cases/delete-student.use-case.js';
import { GetStudentByIdUseCase } from './use-cases/get-student-by-id.use-case.js';
import { GetStudentsUseCase } from './use-cases/get-students.use-case.js';
import { UpdateStudentUseCase } from './use-cases/update-student.use-case.js';
import { ToggleStudentActiveUseCase } from './use-cases/toggle-student-active.use-case.js';
import { BulkImportStudentsUseCase } from './use-cases/bulk-import-student.use-case.js';
import { ExportStudentsUseCase } from './use-cases/export-student.use-case.js';
import { AddStudentAddressUseCase } from './use-cases/add-student-address.use-case.js';
import { GetStudentAddressesUseCase } from './use-cases/get-student-addresses.use-case.js';
import { UpdateStudentAddressUseCase } from './use-cases/update-student-address.use-case.js';
import { RemoveStudentAddressUseCase } from './use-cases/remove-student-address.use-case.js';
import { CreateStudentParentUseCase } from './use-cases/create-student-parent.use-case.js';
import { GetStudentParentsListUseCase } from './use-cases/get-student-parents-list.use-case.js';
import { GetStudentParentByIdUseCase } from './use-cases/get-student-parent-by-id.use-case.js';
import { UpdateStudentParentUseCase } from './use-cases/update-student-parent.use-case.js';
import { DeleteStudentParentUseCase } from './use-cases/delete-student-parent.use-case.js';
import { UpdateStudentProfileUseCase } from './use-cases/update-student-profile.use-case.js';

@Module({
  imports: [UserModule, GradeModule, ClassroomModule],
  controllers: [
    StudentController,
    StudentAddressController,
    StudentParentController,
    StudentProfileController,
  ],
  providers: [
    { provide: StudentRepository, useClass: PrismaStudentRepository },
    {
      provide: StudentAddressRepository,
      useClass: PrismaStudentAddressRepository,
    },
    {
      provide: StudentParentRepository,
      useClass: PrismaStudentParentRepository,
    },
    ExcelStudentParser,
    CreateStudentUseCase,
    DeleteStudentUseCase,
    GetStudentByIdUseCase,
    GetStudentsUseCase,
    UpdateStudentUseCase,
    ToggleStudentActiveUseCase,
    BulkImportStudentsUseCase,
    ExportStudentsUseCase,
    AddStudentAddressUseCase,
    GetStudentAddressesUseCase,
    UpdateStudentAddressUseCase,
    RemoveStudentAddressUseCase,
    CreateStudentParentUseCase,
    GetStudentParentsListUseCase,
    GetStudentParentByIdUseCase,
    UpdateStudentParentUseCase,
    DeleteStudentParentUseCase,
    UpdateStudentProfileUseCase,
  ],
  exports: [
    StudentRepository,
    StudentAddressRepository,
    StudentParentRepository,
  ],
})
export class StudentModule {}
