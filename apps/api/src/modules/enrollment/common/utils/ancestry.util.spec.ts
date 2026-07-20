import { AncestryRelation, AncestryVerificationStatus } from '@/generated/prisma/enums';
import { ancestryDataChanged, buildAncestryData, upsertAncestry } from './ancestry.util';

describe('upsertAncestry (admin verification resets on member edit)', () => {
    const enrollmentId = 'enrollment-1';
    const relation = AncestryRelation.MOTHER;

    const savedRow = {
        name: 'Yuiza',
        dateOfBirth: new Date('1950-05-01'),
        nationality: 'Puerto Rican',
        municipality: 'Loíza',
        yucayeke: 'Yuisa (Jaymanío)',
        isBorikuaTaino: true,
    };

    const sameInput = {
        name: 'Yuiza',
        dateOfBirth: '1950-05-01',
        nationality: 'Puerto Rican',
        municipality: 'Loíza',
        yucayeke: 'Yuisa (Jaymanío)',
        isBorikuaTaino: true,
    };

    function buildTx(existing: Record<string, unknown> | null) {
        return {
            ancestry: {
                findUnique: jest.fn().mockResolvedValue(existing),
                upsert: jest.fn().mockResolvedValue({}),
            },
        };
    }

    it('resets verification when a member edit changes the row', async () => {
        const tx = buildTx(savedRow);

        await upsertAncestry(tx as never, enrollmentId, relation, {
            ...sameInput,
            name: 'Yuiza Cacica',
        });

        expect(tx.ancestry.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    verificationStatus: AncestryVerificationStatus.UNVERIFIED,
                    verifiedAt: null,
                    verifiedByUserId: null,
                }),
            }),
        );
    });

    it('keeps verification when a re-save changes nothing', async () => {
        const tx = buildTx(savedRow);

        await upsertAncestry(tx as never, enrollmentId, relation, sameInput);

        const updateArg = tx.ancestry.upsert.mock.calls[0][0].update;
        expect(updateArg).not.toHaveProperty('verificationStatus');
        expect(updateArg).not.toHaveProperty('verifiedAt');
        expect(updateArg).not.toHaveProperty('verifiedByUserId');
    });

    it('creates new rows without touching verification fields', async () => {
        const tx = buildTx(null);

        await upsertAncestry(tx as never, enrollmentId, relation, sameInput);

        const createArg = tx.ancestry.upsert.mock.calls[0][0].create;
        expect(createArg).not.toHaveProperty('verificationStatus');
    });
});

describe('ancestryDataChanged', () => {
    const existing = {
        name: 'Yuiza',
        dateOfBirth: new Date('1950-05-01'),
        nationality: null,
        municipality: null,
        yucayeke: null,
        isBorikuaTaino: null,
    };

    it('is false for identical data', () => {
        expect(
            ancestryDataChanged(
                existing,
                buildAncestryData({ name: 'Yuiza', dateOfBirth: '1950-05-01' }),
            ),
        ).toBe(false);
    });

    it('is true when a field differs', () => {
        expect(
            ancestryDataChanged(
                existing,
                buildAncestryData({ name: 'Yuiza', dateOfBirth: '1950-05-02' }),
            ),
        ).toBe(true);
    });
});
