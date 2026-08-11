import { CSV_BOM, csvField, csvFilenameSlug, toCsv } from './csv.util';

describe('csvField', () => {

    it('quotes every field', () => {
        expect(csvField('Anani')).toBe('"Anani"');
    });

    it('doubles embedded quotes instead of breaking the row', () => {
        expect(csvField('Ana "Nani" Guarocuya')).toBe(
            '"Ana ""Nani"" Guarocuya"',
        );
    });

    it('keeps commas and newlines inside the field', () => {
        expect(csvField('Hall A, room 2\nback door')).toBe(
            '"Hall A, room 2\nback door"',
        );
    });

    it('writes an empty field for missing data, not the word null', () => {
        expect(csvField(null)).toBe('""');
        expect(csvField(undefined)).toBe('""');
    });

    it('renders dates as ISO-8601', () => {
        expect(csvField(new Date('2026-08-10T12:00:00Z'))).toBe(
            '"2026-08-10T12:00:00.000Z"',
        );
    });

    it.each(['=SUM(A1)', '+1', '-1', '@name'])(
        'defuses %s so a spreadsheet does not run it',
        (value) => {
            expect(csvField(value)).toBe(`"'${value}"`);
        },
    );
});

describe('toCsv', () => {

    it('leads with a BOM so Excel reads it as UTF-8', () => {
        expect(toCsv(['Name'], [])).toBe(`${CSV_BOM}"Name"\r\n`);
    });

    it('writes the header then one CRLF-terminated row per record', () => {
        const csv = toCsv(
            ['Member ID', 'Name'],
            [
                [1042, 'Anani'],
                [1043, 'Yuisa'],
            ],
        );

        expect(csv).toBe(
            `${CSV_BOM}"Member ID","Name"\r\n"1042","Anani"\r\n"1043","Yuisa"\r\n`,
        );
    });
});

describe('csvFilenameSlug', () => {

    it('flattens a title to a safe filename stem', () => {
        expect(csvFilenameSlug('Areyto Gathering 2026')).toBe(
            'areyto-gathering-2026',
        );
    });

    it('strips accents rather than emitting raw bytes', () => {
        expect(csvFilenameSlug('Sesión de Guanía')).toBe('sesion-de-guania');
    });

    it('never lets a path separator through', () => {
        expect(csvFilenameSlug('../../etc/passwd')).toBe('etc-passwd');
    });

    it('falls back to a name when nothing survives', () => {
        expect(csvFilenameSlug('///')).toBe('export');
    });
});
