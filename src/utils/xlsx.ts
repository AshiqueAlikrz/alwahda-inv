import type { SheetData } from 'write-excel-file/universal';

export interface XlsxColumn<T> {
  header: string;
  // plain numbers stay numbers (so Excel can sum them); strings are written as text
  value: (row: T) => string | number | null | undefined;
  // show numbers with two decimals and thousands separators, e.g. 1,940.00
  money?: boolean;
}

const MONEY_FORMAT = '#,##0.00';
const MIN_WIDTH = 8;
const MAX_WIDTH = 50;

const cellText = (value: string | number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

// Text is written as a string cell, never as a formula, so a value like "=SUM(A1)"
// shows up as plain text in Excel instead of being run.
const toCell = (
  value: string | number | null | undefined,
  money?: boolean,
): SheetData[number][number] => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return money ? { value, type: Number, format: MONEY_FORMAT } : value;
  }
  return { value, type: String };
};

export const buildXlsx = async <T>(
  columns: XlsxColumn<T>[],
  rows: T[],
  sheetName = 'Sheet1',
): Promise<Blob> => {
  // loaded on click, so the library isn't part of the initial page bundle
  const { default: writeExcelFile } = await import(
    'write-excel-file/universal'
  );

  const values = rows.map((row) => columns.map((column) => column.value(row)));

  const sheetData: SheetData = [
    columns.map((column) => ({
      value: column.header,
      type: String,
      fontWeight: 'bold' as const,
      backgroundColor: '#eff4fb',
    })),
    ...values.map((rowValues) =>
      rowValues.map((value, index) => toCell(value, columns[index].money)),
    ),
  ];

  // column width follows the longest value, within a sensible range
  const widths = columns.map((column, index) => {
    const longest = Math.max(
      column.header.length,
      ...values.map((rowValues) => cellText(rowValues[index]).length),
    );
    return { width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + 2)) };
  });

  return writeExcelFile(sheetData, {
    sheet: sheetName,
    columns: widths,
    stickyRowsCount: 1,
  }).toBlob();
};

// "invoices", "unpaid", "2026-09-01", ... -> "invoices_unpaid_2026-09-01.xlsx"
export const xlsxFilename = (
  ...parts: (string | null | undefined | false)[]
) =>
  `${parts
    .filter(Boolean)
    .join('_')
    .replace(/[^\w.-]+/g, '-')}.xlsx`;

// Excel sheet names can't contain : \ / ? * [ ] and are limited to 31 characters
const safeSheetName = (filename: string) =>
  filename
    .replace(/\.xlsx$/, '')
    .replace(/[:\\/?*[\]]/g, '-')
    .slice(0, 31) || 'Sheet1';

export const downloadXlsx = async <T>(
  filename: string,
  columns: XlsxColumn<T>[],
  rows: T[],
) => {
  const blob = await buildXlsx(columns, rows, safeSheetName(filename));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
