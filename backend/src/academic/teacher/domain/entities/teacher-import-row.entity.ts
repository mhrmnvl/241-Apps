/**
 * One spreadsheet row as read from the file, before any validation.
 *
 * The parser cannot promise a valid {@link BulkImportTeacherRowDto}: a cell may
 * be blank, `gender` may hold any string the operator typed, and `birthDate` is
 * whatever text was in the column. The import use case is what turns a row into
 * a DTO (`plainToInstance`) and validates it, collecting per-row errors — so the
 * parser's contract stops at "these are the columns we recognised".
 */
export interface TeacherImportRow {
  identifier: string;
  password: string;
  name: string;
  nik: string;
  gender?: string;
  birthPlace: string;
  birthDate: string;
  email?: string;
  phone?: string;
  nip?: string;
  nuptk?: string;
  employmentTypeCode: string;
}
