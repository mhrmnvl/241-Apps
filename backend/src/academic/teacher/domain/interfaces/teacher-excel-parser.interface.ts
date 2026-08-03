import { TeacherImportRow } from '../entities/teacher-import-row.entity.js';

export abstract class ExcelTeacherParser {
  abstract parse(buffer: Buffer): Promise<TeacherImportRow[]>;
}
