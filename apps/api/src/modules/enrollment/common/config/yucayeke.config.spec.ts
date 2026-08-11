import {
    ACCEPTED_YUCAYEKE_VALUES,
    canonicalizeYucayeke,
    LEGACY_YUCAYEKES,
    OFFICIAL_YUCAYEKES,
} from './yucayeke.config';

describe('yucayeke.config', () => {
    it('offers the client\'s 18 registered yucayekes plus the 3 retained ones', () => {
        expect(OFFICIAL_YUCAYEKES).toHaveLength(21);
        expect(OFFICIAL_YUCAYEKES.filter((v) => v.startsWith('Yukayeke '))).toHaveLength(18);
        // Absent from the client's register but deliberately still selectable.
        expect(OFFICIAL_YUCAYEKES).toEqual(
            expect.arrayContaining(['Guajataca', 'Hayuya', 'Loquillo']),
        );
    });

    it('accepts every superseded spelling on write', () => {
        // A draft holding an old value must not 400 on save.
        for (const legacy of LEGACY_YUCAYEKES) {
            expect(ACCEPTED_YUCAYEKE_VALUES).toContain(legacy);
        }
    });

    it('canonicalizes superseded spellings to the current official name', () => {
        expect(canonicalizeYucayeke('Guaynía')).toBe('Yukayeke Wainia');
        expect(canonicalizeYucayeke('Yuisa (Jaymanío)')).toBe('Yukayeke Aimanio');
        expect(canonicalizeYucayeke('Urayoán (Yagüeca)')).toBe('Yukayeke Yawekax');
        expect(canonicalizeYucayeke('Mabodamaca')).toBe('Guajataca');
    });

    it('is diacritic- and case-insensitive', () => {
        expect(canonicalizeYucayeke('guaynia')).toBe('Yukayeke Wainia');
        expect(canonicalizeYucayeke('  GUAYNÍA  ')).toBe('Yukayeke Wainia');
    });

    it('leaves current official values untouched', () => {
        for (const official of OFFICIAL_YUCAYEKES) {
            expect(canonicalizeYucayeke(official)).toBe(official);
        }
    });

    it('passes through free text and nullish values rather than discarding them', () => {
        // Pre-restriction rows hold arbitrary text; rewriting it is not ours to do.
        expect(canonicalizeYucayeke('TestYuca')).toBe('TestYuca');
        expect(canonicalizeYucayeke(null)).toBeNull();
        expect(canonicalizeYucayeke(undefined)).toBeUndefined();
    });
});
