import { Prisma } from '@/generated/prisma/client';
import { AncestryRelation } from '@/generated/prisma/enums';
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
 * upsertAncestry: upserts a single kinship row keyed by (enrollmentId, relation).
 */
export function upsertAncestry(
    tx: Prisma.TransactionClient,
    enrollmentId: string,
    relation: AncestryRelation,
    input: AncestryInput | undefined,
) {
    const data = buildAncestryData(input);

    return tx.ancestry.upsert({
        where: {
            enrollmentId_relation: { enrollmentId, relation },
        },
        update: data,
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
} | null | undefined) {
    if (!row) {
        return null;
    }

    return {
        name          : row.name,
        dateOfBirth   : row.dateOfBirth,
        nationality   : row.nationality,
        municipality  : row.municipality,
        yucayeke      : row.yucayeke,
        isBorikuaTaino: row.isBorikuaTaino,
    };
}
