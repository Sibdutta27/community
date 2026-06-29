/**
 * Seed the user table with an admin user if it doesn't already exist.
 */

import { prisma } from "./seed";
import { hashPassword } from "../../src/common/utils/password.util";
import { formatPublicId } from "../../src/common/utils/formater.util";



export async function seedUser() {
    console.log("START SEEDING USER...")

    const adminEmail  = "admin@example.com";
    const adminName   = "Test Admin";
    const rowPassword = "admin123";

    const hashedPassword = await hashPassword(rowPassword);

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                name    : adminName,
                email   : adminEmail,
                password: hashedPassword,
                role    : "ADMIN",
            },
        });

        if ( user.publicId ) {
            return user;
        }

        const publicId = formatPublicId('TNB', user.serial);

        return tx.user.update({
            where: { id: user.id },
            data : { publicId },
        });
    });
}