/**
 * Seed the event category table with default values if they don't already exist.
 */

import { prisma } from "../seed";

export async function seedEventCategory() {
    console.log("START SEEDING EVENT CATEGORIES...")

    const eventCategories = [
        {
            key        : "cultural_events",
            name       : "Cultural Events",
            description: "Ceremonies, festivals, and traditional celebrations",
            icon       : "cultural_events",
        },
        {
            key        : "workshops",
            name       : "Workshops",
            description: "Hands-on learning and skill development sessions",
            icon       : "workshops",
        },
        {
            key        : "ceremonies",
            name       : "Ceremonies",
            description: "Sacred rituals and spiritual gatherings",
            icon       : "ceremonies",
        },
        {
            key        : "social_events",
            name       : "Social Events",
            description: "Community gatherings and networking",
            icon       : "social_events",
        }
    ];

    for (const categorie of eventCategories) {
        await prisma.eventCategory.upsert({
            where: {
                key: categorie.key
            },
            update: {
                name       : categorie.name,
                description: categorie.description,
                icon       : categorie.icon
            },
            create: {
                key        : categorie.key,
                name       : categorie.name,
                description: categorie.description,
                icon       : categorie.icon
            }
        });
    }
}