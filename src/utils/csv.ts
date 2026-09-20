export interface CsvColumn<T> {
  header: string;
  // plain numbers stay numbers (so spreadsheets can sum them); strings are treated as text
  value: (row: T) => string | number | null | undefined;
  // write numbers with two decimals, e.g. 1940.00
  money?: boolean;
}

// A text cell starting with one of these is read as a formula by Excel / Sheets
// (CSV injection), so it is prefixed with an apostrophe to force plain text.
const FORMULA_START = /^[=+\-@\t\r]/;

const cell = (value: string | number | null | undefined, money?: boolean) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return money ? value.toFixed(2) : String(value);
  }
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = <T>(columns: CsvColumn<T>[], rows: T[]) => {
  const lines = [
    columns.map((column) => cell(column.header)).join(','),
    ...rows.map((row) =>
      columns.map((column) => cell(column.value(row), column.money)).join(','),
    ),
  ];
  // CRLF is what spreadsheets expect
  return lines.join('\r\n') + '\r\n';
};

// "invoices", "unpaid", "2026-09-01", ... -> "invoices_unpaid_2026-09-01.csv"
export const csvFilename = (...parts: (string | null | undefined | false)[]) =>
  `${parts
    .filter(Boolean)
    .join('_')
    .replace(/[^\w.-]+/g, '-')}.csv`;

export const downloadCsv = <T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
) => {
  // the BOM makes Excel read the file as UTF-8, so Arabic names come through correctly
  const blob = new Blob(['﻿', toCsv(columns, rows)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
