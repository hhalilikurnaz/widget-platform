import type { SubmissionExportRow } from '../types/submission.types.js';

const CSV_HEADERS = ['Date', 'Widget', 'Version', 'Payload', 'Country', 'Browser', 'Device'] as const;

export function generateSubmissionsCsv(rows: SubmissionExportRow[]): string {
  const lines = [CSV_HEADERS.join(',')];

  for (const row of rows) {
    lines.push(
      [
        escapeCsv(row.date),
        escapeCsv(row.widget),
        String(row.version),
        escapeCsv(row.payload),
        escapeCsv(row.country),
        escapeCsv(row.browser),
        escapeCsv(row.device),
      ].join(','),
    );
  }

  return `${lines.join('\n')}\n`;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
