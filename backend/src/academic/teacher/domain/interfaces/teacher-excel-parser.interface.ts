import { BulkImportTeacherRowDto } from '../../dto/request/bulk-import-teacher.dto.js';

export abstract class ExcelTeacherParser {
  abstract parse(buffer: Buffer): Promise<BulkImportTeacherRowDto[]>;
}
