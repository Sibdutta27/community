/**
 * Seed the event table with default values if they don't already exist.
 */

import { prisma } from "../seed";

export async function seedEvent() {
    console.log("START SEEDING Events...")

    // If there are no service categories, we can't seed services as they depend on categories
    const categoryCount = await prisma.eventCategory.count();
    if (categoryCount === 0) {
        console.warn("No event categories found. Please seed event categories before seeding services.");
        return;
    }

    // If there are already event, we can skip seeding to avoid duplicates
    const eventCount = await prisma.event.count();
    if (eventCount > 0) {
        console.log("Event already exist. Skipping seeding events.");
        return;
    }

    // Get the event categories to link with services
    const eventCategories = await prisma.eventCategory.findMany();


    const events = [
        // ✅ PAST EVENTS
        {
            title        : "Spring Harvest Festival",
            description  : "Celebration of seasonal harvest with music and food",
            categoryId   : eventCategories.find(c => c.key === "cultural_events")?.id!,
            startDateTime: new Date("2024-03-10T10:00:00Z"),
            endDateTime  : new Date("2024-03-10T15:00:00Z"),
            location     : "Green Field Arena",
            maxCapacity  : 120,
        },
        {
            title        : "Community Networking Meetup",
            description  : "Meet and connect with local professionals",
            categoryId   : eventCategories.find(c => c.key === "social_events")?.id!,
            startDateTime: new Date("2024-05-05T16:00:00Z"),
            endDateTime  : new Date("2024-05-05T19:00:00Z"),
            location     : "City Hall",
            maxCapacity  : 80,
        },
        {
            title        : "Meditation & Healing Ceremony",
            description  : "Guided meditation and spiritual healing",
            categoryId   : eventCategories.find(c => c.key === "ceremonies")?.id!,
            startDateTime: new Date("2024-07-15T06:00:00Z"),
            endDateTime  : new Date("2024-07-15T08:00:00Z"),
            location     : "Riverbank Retreat",
            maxCapacity  : 40,
        },
        {
            title        : "Photography Workshop",
            description  : "Learn basics of DSLR and mobile photography",
            categoryId   : eventCategories.find(c => c.key === "workshops")?.id!,
            startDateTime: new Date("2024-09-01T11:00:00Z"),
            endDateTime  : new Date("2024-09-01T14:00:00Z"),
            location     : "Creative Studio",
            maxCapacity  : 25,
        },
        {
            title        : "Autumn Cultural Fest",
            description  : "Music, dance, and traditional performances",
            categoryId   : eventCategories.find(c => c.key === "cultural_events")?.id!,
            startDateTime: new Date("2024-10-20T17:00:00Z"),
            endDateTime  : new Date("2024-10-20T22:00:00Z"),
            location     : "Open Air Theatre",
            maxCapacity  : 200,
        },

        // ✅ TODAY EVENTS (dynamic)
        {
            title        : "Morning Yoga Session",
            description  : "Start your day with guided yoga",
            categoryId   : eventCategories.find(c => c.key === "workshops")?.id!,
            startDateTime: new Date(new Date().setHours(6, 0, 0, 0)),
            endDateTime  : new Date(new Date().setHours(7, 30, 0, 0)),
            location     : "Community Park",
            maxCapacity  : 30,
        },
        {
            title        : "Evening Social Gathering",
            description  : "Relax and socialize with the community",
            categoryId   : eventCategories.find(c => c.key === "social_events")?.id!,
            startDateTime: new Date(new Date().setHours(18, 0, 0, 0)),
            endDateTime  : new Date(new Date().setHours(20, 0, 0, 0)),
            location     : "Club House",
            maxCapacity  : 60,
        },

        // ✅ UPCOMING EVENTS
        {
            title        : "Winter Solstice Ceremony",
            description  : "Traditional celebration honoring the changing seasons",
            categoryId   : eventCategories.find(c => c.key === "cultural_events")?.id!,
            startDateTime: new Date("2026-12-21T18:00:00Z"),
            endDateTime  : new Date("2026-12-21T21:00:00Z"),
            location     : "Sacred Grounds",
            maxCapacity  : 50,
        },
        {
            title        : "Art & Craft Workshop",
            description  : "Hands-on session for creative art skills",
            categoryId   : eventCategories.find(c => c.key === "workshops")?.id!,
            startDateTime: new Date("2026-06-15T10:00:00Z"),
            endDateTime  : new Date("2026-06-15T13:00:00Z"),
            location     : "Art Center",
            maxCapacity  : 20,
        },
        {
            title        : "Spiritual Chanting Ceremony",
            description  : "Group chanting and spiritual gathering",
            categoryId   : eventCategories.find(c => c.key === "ceremonies")?.id!,
            startDateTime: new Date("2026-07-10T05:00:00Z"),
            endDateTime  : new Date("2026-07-10T07:00:00Z"),
            location     : "Temple Grounds",
            maxCapacity  : 70,
        },
        {
            title        : "Startup Networking Night",
            description  : "Entrepreneurs meet and share ideas",
            categoryId   : eventCategories.find(c => c.key === "social_events")?.id!,
            startDateTime: new Date("2026-08-01T17:00:00Z"),
            endDateTime  : new Date("2026-08-01T20:00:00Z"),
            location     : "Business Hub",
            maxCapacity  : 100,
        },
        {
            title        : "Folk Dance Festival",
            description  : "Experience traditional dance performances",
            categoryId   : eventCategories.find(c => c.key === "cultural_events")?.id!,
            startDateTime: new Date("2026-09-05T18:00:00Z"),
            endDateTime  : new Date("2026-09-05T22:00:00Z"),
            location     : "Cultural Stage",
            maxCapacity  : 150,
        },
        {
            title        : "Cooking Masterclass",
            description  : "Learn traditional recipes from experts",
            categoryId   : eventCategories.find(c => c.key === "workshops")?.id!,
            startDateTime: new Date("2026-06-25T09:00:00Z"),
            endDateTime  : new Date("2026-06-25T12:00:00Z"),
            location     : "Kitchen Studio",
            maxCapacity  : 15,
        },
        {
            title        : "Full Moon Ritual",
            description  : "Sacred full moon spiritual ceremony",
            categoryId   : eventCategories.find(c => c.key === "ceremonies")?.id!,
            startDateTime: new Date("2026-07-20T19:00:00Z"),
            endDateTime  : new Date("2026-07-20T21:00:00Z"),
            location     : "Hilltop Shrine",
            maxCapacity  : 40,
        },
        {
            title        : "Community Picnic Day",
            description  : "Outdoor fun with games and food",
            categoryId   : eventCategories.find(c => c.key === "social_events")?.id!,
            startDateTime: new Date("2026-08-15T10:00:00Z"),
            endDateTime  : new Date("2026-08-15T16:00:00Z"),
            location     : "Lakeside Park",
            maxCapacity  : 200,
        },
    ];

    await prisma.event.createMany({
        data          : events,
        skipDuplicates: true,
    });
}
