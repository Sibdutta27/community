/**
 * Project `apps/web/messages/{en,es}.json` into the `ContentKey` table.
 *
 * The catalogs stay the source of truth. This table is a derived index so the
 * Website Studio can list what is editable, show the shipped default beside
 * an edit, and reject an override aimed at a key path the site does not have.
 *
 * Run it after any change to the catalogs — adding a key in a PR and not
 * syncing just means staff cannot edit that key yet; nothing breaks.
 *
 *   pnpm --filter yucayekeconnect-server content:sync [--dry-run]
 *
 * Deliberately a script, not a runtime read: the API is deployed as a Vercel
 * function whose bundle does not contain `apps/web`, so reading those files at
 * request time would work locally and fail in production.
 *
 * Keys are NEVER deleted. A key the catalog no longer has is marked
 * `retiredAt`, so an override that outlived its key stays visible and
 * explainable instead of disappearing.
 */
import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import {
    EDITABLE_NAMESPACES,
    extractPlaceholders,
    flattenCatalog,
} from "../../src/modules/content/content.util";

// Prisma schema-qualifies its SQL, so the target schema must be passed
// explicitly — otherwise a run aimed at another lane silently hits `public`.
const targetSchema = process.env.DATABASE_SCHEMA?.trim();

const adapter = new PrismaPg(
    { connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! },
    targetSchema ? { schema: targetSchema } : undefined,
);

const prisma = new PrismaClient({ adapter });

const isDryRun = process.argv.includes("--dry-run");

const MESSAGES_DIR = join(__dirname, "../../../web/messages");

function readCatalog(locale: string): unknown {
    return JSON.parse(
        readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8"),
    );
}

async function main() {
    const enLeaves = flattenCatalog(readCatalog("en"));
    const esLeaves = new Map(
        flattenCatalog(readCatalog("es")).map((leaf) => [leaf.keyPath, leaf.value]),
    );

    console.log(
        `[content:sync] catalog has ${enLeaves.length} keys (schema=${targetSchema ?? "public"})`,
    );

    // A key present in en but not es would break the paired editor. The parity
    // test already guards this in CI; failing loudly here too means a bad sync
    // can never half-populate the table.
    const missingEs = enLeaves.filter((leaf) => !esLeaves.has(leaf.keyPath));

    if (missingEs.length > 0) {
        throw new Error(
            `[content:sync] ${missingEs.length} key(s) missing from es.json, refusing to sync: ` +
                missingEs.slice(0, 5).map((leaf) => leaf.keyPath).join(", "),
        );
    }

    const rows = enLeaves.map((leaf) => {
        const [namespace, group] = leaf.keyPath.split(".");

        return {
            keyPath: leaf.keyPath,
            namespace,
            group: group ?? null,
            defaultEn: leaf.value,
            defaultEs: esLeaves.get(leaf.keyPath)!,
            isArrayLeaf: leaf.isArrayLeaf,
            placeholders: extractPlaceholders(leaf.value),
            editable: EDITABLE_NAMESPACES.has(namespace),
        };
    });

    const editableCount = rows.filter((row) => row.editable).length;

    console.log(
        `[content:sync] ${editableCount} editable, ${rows.length - editableCount} developer-owned`,
    );

    const existing = await prisma.contentKey.findMany({
        select: { keyPath: true },
    });

    const existingPaths = new Set(existing.map((row) => row.keyPath));
    const incomingPaths = new Set(rows.map((row) => row.keyPath));

    const added = rows.filter((row) => !existingPaths.has(row.keyPath));
    const retired = [...existingPaths].filter((path) => !incomingPaths.has(path));

    console.log(
        `[content:sync] ${added.length} new, ${rows.length - added.length} updated, ${retired.length} retired`,
    );

    if (isDryRun) {
        console.log("[content:sync] --dry-run, no writes");
        return;
    }

    for (const row of rows) {
        await prisma.contentKey.upsert({
            where: { keyPath: row.keyPath },
            create: row,
            // `retiredAt: null` on update deliberately un-retires a key that
            // came back — a reverted deletion should restore editing.
            update: { ...row, retiredAt: null },
        });
    }

    if (retired.length > 0) {
        await prisma.contentKey.updateMany({
            where: { keyPath: { in: retired }, retiredAt: null },
            data: { retiredAt: new Date() },
        });

        for (const path of retired) {
            console.log(`[content:sync]   retired ${path}`);
        }
    }

    console.log("[content:sync] done");
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
