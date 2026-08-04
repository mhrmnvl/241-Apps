import ExcelJS from 'exceljs';

/**
 * `dataValidations` exists at runtime but is missing from exceljs' shipped
 * typings. Augment it once here instead of re-declaring the same module
 * augmentation inside every export use-case.
 */
declare module 'exceljs' {
  interface Worksheet {
    dataValidations: {
      add(range: string, validation: ExcelJS.DataValidation): void;
    };
  }
}

/** One spreadsheet row keyed by column header. */
export type ExcelRow = Record<string, ExcelJS.CellValue>;
