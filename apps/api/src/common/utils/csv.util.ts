/**
 * Minimal CSV writer for the admin export endpoints.
 *
 * Spreadsheets are the format staff actually work in, so the exports have to
 * survive being opened in one: every field is quoted, embedded quotes are
 * doubled, and a leading BOM is emitted so Excel reads the accented names in
 * the member roster as UTF-8 instead of mojibake.
 */

/**
 * Excel and Sheets treat a cell that opens with one of these as a formula, so
 * a member who signed up as `=cmd|...` would otherwise become an executable
 * cell in whatever machine opens the roster.
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Byte-order mark — the difference between "Guania" spelled with an accent and
 * a row of mojibake when the file is double-clicked on Windows.
 */
export const CSV_BOM = '\uFEFF';

/**
 * Render one value as a quoted CSV field.
 *
 * `null`/`undefined` become an empty field rather than the string "null":
 * a blank cell reads as "we don't have this", which is what it means.
 */
export function csvField(value: unknown): string {
    if (value === null || value === undefined) {
        return '""';
    }

    let text = value instanceof Date
        ? value.toISOString()
        : String(value);

    if (FORMULA_TRIGGERS.includes(text.charAt(0))) {
        text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Render a header row plus body rows as a CSV document (CRLF line endings,
 * which is what RFC 4180 and Excel both expect).
 */
export function toCsv(
    headers: string[],
    rows: unknown[][],
): string {
    const lines = [
        headers.map(csvField).join(','),

        ...rows.map((row) => row.map(csvField).join(',')),
    ];

    return `${CSV_BOM}${lines.join('\r\n')}\r\n`;
}

/**
 * Turn a title into something safe to put in a Content-Disposition filename:
 * ASCII-ish, no spaces, no path separators.
 */
export function csvFilenameSlug(value: string): string {
    const slug = value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

    return slug || 'export';
}
