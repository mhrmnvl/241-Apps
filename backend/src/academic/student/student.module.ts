import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../../platform/user/user.module.js';
import { GradeModule } from '../grade/grade.module.js';
import { ClassroomModule } from '../classroom/classroom.module.js';
import { EnrollmentModule } from '../enrollment/enrollment.module.js';
import { StudentController } from './presentation/student.controller.js';
import { StudentImportExportController } from './presentation/student-import-export.controller.js';
import { StudentAddressController } from './presentation/student-address.controller.js';
import { StudentParentController } from './presentation/student-parent.controller.js';
import { StudentProfileController } from './presentation/student-profile.controller.js';
import { IStudentRepository } from './domain/interfaces/student-repository.interface.js';
import { IStudentIdentityReadPort } from './domain/interfaces/student-identity-read.port.js';
import { PrismaStudentIdentityReadPort } from './infrastructure/persistence/prisma-student-identity.read-port.js';
import { IStudentAddressRepository } from './domain/interfaces/student-address-repository.interface.js';
import { IStudentParentRepository } from './domain/interfaces/student-parent-repository.interface.js';
import { PrismaStudentRepository } from './infrastructure/persistence/prisma-student.repository.js';
import { PrismaStudentAddressRepository } from './infrastructure/persistence/prisma-student-address.repository.js';
import { PrismaStudentParentRepository } from './infrastructure/persistence/prisma-student-parent.repository.js';
import { ExcelStudentParser as ExcelStudentParserConcrete } from './infrastructure/parsers/excel-student.parser.js';
import { ExcelStudentParser } from './domain/interfaces/student-excel-parser.interface.js';
import { CreateStudentUseCase } from './use-cases/create-student.use-case.js';
import { CreateStudentWithRelationsUseCase } from './use-cases/create-student-with-relations.use-case.js';
import { DeleteStudentUseCase } from './use-cases/delete-student.use-case.js';
import { GetStudentByIdUseCase } from './use-cases/get-student-by-id.use-case.js';
import { GetStudentsUseCase } from './use-cases/get-students.use-case.js';
import { UpdateStudentUseCase } from './use-cases/update-student.use-case.js';
import { ToggleStudentActiveUseCase } from './use-cases/toggle-student-active.use-case.js';
import { BulkImportStudentsUseCase } from './use-cases/bulk-import-student.use-case.js';
import { ResolveBulkImportConflictsUseCase } from './use-cases/resolve-bulk-import-conflicts.use-case.js';
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
  imports: [
    UserModule,
    GradeModule,
    ClassroomModule,
    forwardRef(() => EnrollmentModule),
  ],
  controllers: [
    StudentImportExportController,
    StudentController,
    StudentAddressController,
    StudentParentController,
    StudentProfileController,
  ],
  providers: [
    { provide: IStudentRepository, useClass: PrismaStudentRepository },
    {
      provide: IStudentIdentityReadPort,
      useClass: PrismaStudentIdentityReadPort,
    },
    {
      provide: IStudentAddressRepository,
      useClass: PrismaStudentAddressRepository,
    },
    {
      provide: IStudentParentRepository,
      useClass: PrismaStudentParentRepository,
    },
    { provide: ExcelStudentParser, useClass: ExcelStudentParserConcrete },
    CreateStudentUseCase,
    CreateStudentWithRelationsUseCase,
    DeleteStudentUseCase,
    GetStudentByIdUseCase,
    GetStudentsUseCase,
    UpdateStudentUseCase,
    ToggleStudentActiveUseCase,
    BulkImportStudentsUseCase,
    ResolveBulkImportConflictsUseCase,
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
    IStudentRepository,
    IStudentAddressRepository,
    IStudentParentRepository,
    // Consumed by report-card, assessment, attendance and schedule so each can
    // scope a self-service read to the caller without resolving it its own way.
    IStudentIdentityReadPort,
  ],
})
export class StudentModule {}
