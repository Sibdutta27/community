/**
 * Seed the service category table with default values if they don't already exist.
 */

import { prisma } from "../seed";

export async function seedServiceCategory() {
    console.log("START SEEDING SERVICE CATEGORIES...")

    const serviceCategories = [
        {
            key     : "health",
            name    : "Health",
            icon    : "health",
        },
        {
            key     : "legal",
            name    : "Legal",
            icon    : "legal",
        },
        {
            key     : "Education",
            name    : "Education",
            icon    : "education",
        },
        {
            key     : "Support",
            name    : "Support",
            icon    : "support",
        }
    ];

    for (const categories of serviceCategories) {
        await prisma.serviceCategory.upsert({
            where: {
                key: categories.key
            },
            update: {
                name: categories.name,
                icon: categories.icon
            },
            create: {
                key : categories.key,
                name: categories.name,
                icon: categories.icon
            }
        });
    }
}