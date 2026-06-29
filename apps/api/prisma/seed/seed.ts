import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { seedUser } from "./user.seed";
import { seedConsent } from "./consent.seed";
import { seedCulturalConnection } from "./culturalconnection.seed";
import { seedServiceCategory } from "./service/serviceCategory.seed";
import { seedService } from "./service/service.seed"
import { seedEventCategory } from "./event/eventCategory.seed";
import { seedEvent } from "./event/event.seed";

// Initialize the Prisma client with the PostgreSQL adapter.
const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});

// Create a new Prisma client instance using the adapter.
export const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("START SEEDING...");

    // Seed the user
    await seedUser();

    // Seed the consents
    await seedConsent();

    // Seed the cultural connection
    await seedCulturalConnection();

    // Seed the service categories
    await seedServiceCategory();

    // Seed the services
    await seedService();

    // Seed the event categories
    await seedEventCategory();

    // Seed the events
    await seedEvent();

    console.log("DONE SEEDING");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
