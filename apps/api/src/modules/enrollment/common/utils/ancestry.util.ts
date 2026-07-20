import { Prisma } from '@/generated/prisma/client';
import { AncestryRelation, AncestryVerificationStatus } from '@/generated/prisma/enums';
import { AncestryInput } from '@/modules/enrollment/common/interfaces/enrollment.interface';

/**
 * buildAncestryData: normalizes a kinship person from the DTO into the columns
 * of the Ancestry table. `dateOfBirth` is only meaningful for the parent slots
 * (MOTHER / FATHER); it resolves to null when absent.
 */
export function buildAncestryData(input: AncestryInput | undefined) {
    return {
        name          : input?.name ?? null,
        dateOfBirth   : input?.dateOfBirth ? new Date(input.dateOfBirth) : null,
        nationality   : input?.nationality ?? null,
        municipality  : input?.municipality ?? null,
        yucayeke      : input?.yucayeke ?? null,
        isBorikuaTaino: input?.isBorikuaTaino ?? null,
    };
}

/**
 * ancestryDataChanged: true when the incoming kinship data differs from the
 * persisted row on any member-editable column.
 */
export function ancestryDataChanged(
    existing: {
        name: string | null;
        dateOfBirth: Date | null;
        nationality: string | null;
        municipality: string | null;
        yucayeke: string | null;
        isBorikuaTaino: boolean | null;
    },
    data: ReturnType<typeof buildAncestryData>,
) {
    return (
        existing.name !== data.name ||
        (existing.dateOfBirth?.getTime() ?? null) !== (data.dateOfBirth?.getTime() ?? null) ||
        existing.nationality !== data.nationality ||
        existing.municipality !== data.municipality ||
        existing.yucayeke !== data.yucayeke ||
        existing.isBorikuaTaino !== data.isBorikuaTaino
    );
}

/**
 * upsertAncestry: upserts a single kinship row keyed by (enrollmentId, relation).
 * A member edit that changes the row resets its admin-attested verification —
 * verified data must not silently change under the badge.
 */
export async function upsertAncestry(
    tx: Prisma.TransactionClient,
    enrollmentId: string,
    relation: AncestryRelation,
    input: AncestryInput | undefined,
) {
    const data = buildAncestryData(input);

    const existing = await tx.ancestry.findUnique({
        where: {
            enrollmentId_relation: { enrollmentId, relation },
        },
    });

    const resetVerification = existing && ancestryDataChanged(existing, data)
        ? {
            verificationStatus: AncestryVerificationStatus.UNVERIFIED,
            verifiedAt        : null,
            verifiedByUserId  : null,
        }
        : {};

    return tx.ancestry.upsert({
        where: {
            enrollmentId_relation: { enrollmentId, relation },
        },
        update: { ...data, ...resetVerification },
        create: {
            enrollmentId,
            relation,
            ...data,
        },
    });
}

/**
 * mapAncestryOut: shapes a persisted Ancestry row for prefill / admin responses.
 */
export function mapAncestryOut(row: {
    name: string | null;
    dateOfBirth: Date | null;
    nationality: string | null;
    municipality: string | null;
    yucayeke: string | null;
    isBorikuaTaino: boolean | null;
    verificationStatus?: AncestryVerificationStatus;
    verifiedAt?: Date | null;
} | null | undefined) {
    if (!row) {
        return null;
    }

    return {
        name              : row.name,
        dateOfBirth       : row.dateOfBirth,
        nationality       : row.nationality,
        municipality      : row.municipality,
        yucayeke          : row.yucayeke,
        isBorikuaTaino    : row.isBorikuaTaino,
        verificationStatus: row.verificationStatus ?? AncestryVerificationStatus.UNVERIFIED,
        verifiedAt        : row.verifiedAt ?? null,
    };
}
