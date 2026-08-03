import { StudentImportRow } from '../entities/student-import-row.entity.js';

export abstract class ExcelStudentParser {
  abstract parse(buffer: Buffer): Promise<StudentImportRow[]>;
  abstract buildImportTemplate(): Promise<Buffer>;
}
