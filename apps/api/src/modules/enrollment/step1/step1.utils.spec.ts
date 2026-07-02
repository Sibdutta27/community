import { BadRequestException } from '@nestjs/common';
import { Identity, MaritalStatus } from '@/generated/prisma/enums';
import { mapIdentity, mapMaritalStatus } from './step1.utils';

describe('step1.utils marital status mapping', () => {
    it('maps the DOMESTIC_PARTNERSHIP value to the MaritalStatus enum', () => {
        expect(mapMaritalStatus('DOMESTIC_PARTNERSHIP')).toBe(
            MaritalStatus.DOMESTIC_PARTNERSHIP,
        );
    });

    it('is case-insensitive for DOMESTIC_PARTNERSHIP', () => {
        expect(mapMaritalStatus('domestic_partnership')).toBe(
            MaritalStatus.DOMESTIC_PARTNERSHIP,
        );
    });

    it('still maps the previously supported values', () => {
        expect(mapMaritalStatus('SINGLE')).toBe(MaritalStatus.SINGLE);
        expect(mapMaritalStatus('MARRIED')).toBe(MaritalStatus.MARRIED);
        expect(mapMaritalStatus('DIVORCED')).toBe(MaritalStatus.DIVORCED);
        expect(mapMaritalStatus('WIDOWED')).toBe(MaritalStatus.WIDOWED);
    });

    it('returns undefined for empty / nullish input (optional field)', () => {
        expect(mapMaritalStatus(undefined)).toBeUndefined();
        expect(mapMaritalStatus(null)).toBeUndefined();
        expect(mapMaritalStatus('')).toBeUndefined();
    });

    it('throws a BadRequestException for an unknown marital status', () => {
        expect(() => mapMaritalStatus('COMPLICATED')).toThrow(
            BadRequestException,
        );
        expect(() => mapMaritalStatus('COMPLICATED')).toThrow(
            'Invalid marital status value: COMPLICATED',
        );
    });
});

describe('step1.utils identity mapping', () => {
    it('maps every Identity option', () => {
        expect(mapIdentity('ARAWAK')).toBe(Identity.ARAWAK);
        expect(mapIdentity('KALINAGO')).toBe(Identity.KALINAGO);
        expect(mapIdentity('GARIFUNA')).toBe(Identity.GARIFUNA);
        expect(mapIdentity('TAINO')).toBe(Identity.TAINO);
    });

    it('is case-insensitive', () => {
        expect(mapIdentity('taino')).toBe(Identity.TAINO);
    });

    it('returns undefined for empty / nullish input (optional field)', () => {
        expect(mapIdentity(undefined)).toBeUndefined();
        expect(mapIdentity(null)).toBeUndefined();
        expect(mapIdentity('')).toBeUndefined();
    });

    it('throws a BadRequestException for an unknown identity', () => {
        expect(() => mapIdentity('MAYAN')).toThrow(BadRequestException);
        expect(() => mapIdentity('MAYAN')).toThrow('Invalid identity value: MAYAN');
    });
});
