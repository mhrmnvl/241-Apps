import { BulkImportStudentRowDto } from '../../dto/request/bulk-import-student.dto.js';

export abstract class ExcelStudentParser {
  abstract parse(buffer: Buffer): Promise<BulkImportStudentRowDto[]>;
  abstract buildImportTemplate(): Promise<Buffer>;
}
