/**
 * One-off backfill for the "government ID is mandatory" rule (client
 * 2026-07-20). NOT wired into `prisma/seed/seed.ts` — run it by hand, once,
 * against each environment when the rule ships.
 *
 * Why it is needed
 * ----------------
 * Step 4 used to pass on any 2 of the 3 identity documents, so a DRAFT
 * enrollment can have `EnrollmentStep{stepNumber: 4}.isCompleted = true`
 * with no STATE_ID on file. Those members reach step 5 with Submit enabled
 * and hit a 400 (`missing_state_id`) they cannot self-diagnose. Reopening
 * step 4 puts them back on the upload screen, where the requirement is
 * spelled out.
 *
 * Scope
 * -----
 * - DRAFT enrollments only. SUBMITTED / APPROVED / REJECTED are untouched:
 *   `completeEnrollment` never runs on them, and admin approval gating
 *   deliberately still accepts the old 2-of-3 rule.
 * - Enrollments that already have a STATE_ID document are untouched.
 *
 * Usage
 * -----
 *   pnpm --filter yucayekeconnect-server exec tsx prisma/scripts/reopen-step4-without-state-id.ts [--dry-run]
 *
 * `--dry-run` prints the affected enrollment ids and exits without writing.
 * Every run prints the ids before it writes.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { DocumentType, EnrollmentStatus } from "../../src/generated/prisma/enums";

// Prisma schema-qualifies its SQL, so the target schema must be passed
// explicitly — otherwise a run aimed at another lane silently hits `public`.
const targetSchema = process.env.DATABASE_SCHEMA?.trim();

const adapter = new PrismaPg(
    { connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! },
    targetSchema ? { schema: targetSchema } : undefined,
);

const prisma = new PrismaClient({ adapter });

const isDryRun = process.argv.includes("--dry-run");

async function main() {
    const affected = await prisma.enrollment.findMany({
        where: {
            status  : EnrollmentStatus.DRAFT,
            steps   : { some: { stepNumber: 4, isCompleted: true } },
            documents: { none: { type: DocumentType.STATE_ID } },
        },
        select: {
            id    : true,
            userId: true,
        },
    });

    console.log(
        `[reopen-step4] ${affected.length} DRAFT enrollment(s) have step 4 complete without a STATE_ID.`,
    );

    for (const enrollment of affected) {
        console.log(
            `[reopen-step4]   enrollment=${enrollment.id} user=${enrollment.userId}`,
        );
    }

    if (affected.length === 0) {
        return;
    }

    if (isDryRun) {
        console.log("[reopen-step4] --dry-run: no changes written.");
        return;
    }

    const result = await prisma.enrollmentStep.updateMany({
        where: {
            stepNumber  : 4,
            isCompleted : true,
            enrollmentId: { in: affected.map(enrollment => enrollment.id) },
        },
        data: { isCompleted: false },
    });

    console.log(`[reopen-step4] Reopened step 4 on ${result.count} enrollment(s).`);
}

main()
    .catch((error) => {
        console.error("[reopen-step4] FAILED", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
