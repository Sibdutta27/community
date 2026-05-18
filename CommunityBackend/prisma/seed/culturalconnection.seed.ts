/**
 * Seed the cultural connection table with default values if they don't already exist.
 */

import { prisma } from "./seed";

export async function seedCulturalConnection() {
    console.log("START SEEDING CULTURAL CONNECTION...")

    const culturalConnections = [
        {
            key        : "medicinal_plant_knowledge",
            description: "Traditional medicinal plant knowledge",
            active     : true,
        },
        {
            key        : "traditional_food_preparation",
            description: 'Traditional food preparation methods',
            active     : true,
        },
        {
            key        : "oral_histories_and_family_stories",
            description: 'Oral histories and family stories',
            active     : true,
        },
        {
            key        : "traditional_crafts_or_artisan_skills",
            description: 'Traditional crafts or artisan skills',
            active     : true,
        },
        {
            key        : "spiritual_or_ceremonial_practices",
            description: 'Spiritual or ceremonial practices',
            active     : true,
        },
        {
            key        : "language_preservation",
            description: 'Language preservation (words, phrases, songs)',
            active     : true,
        },
        {
            key        : "connection_to_ancestral_lands_or_sacred_sites",
            description: 'Connection to ancestral lands or sacred sites',
            active     : true,
        },
    ];

    for (const culturalConnection of culturalConnections) {
        await prisma.culturalConnection.upsert({
            where: {
                key: culturalConnection.key
            },
            update: {
                description: culturalConnection.description,
                active     : culturalConnection.active
            },
            create: {
                key        : culturalConnection.key,
                description: culturalConnection.description,
                active     : culturalConnection.active
            }
        });
    }
}
