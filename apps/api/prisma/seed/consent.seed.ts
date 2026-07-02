/**
 * Seed the consent table with default values if they don't already exist.
 */

import { prisma } from "./seed";

export async function seedConsent() {
    console.log("START SEEDING CONSENT...")

    const consents = [
        {
            key     : "accuracy_declaration",
            title   : "Accuracy Declaration",
            content : "I certify that all information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in denial of enrollment.",
            required: true,
            version : 1,
        },
        {
            key     : "data_privacy_agreement",
            title   : "Data Privacy Agreement",
            content : "I understand that my personal information will be stored securely within the Taino Nation's sovereign database and will only be accessed by authorized enrollment reviewers.",
            required: true,
            version : 1
        },
        {
            key     : "communication_consent",
            title   : "Communication Consent",
            content : "I consent to receive communications from the Taino Nation regarding my enrollment application and community updates via email, phone, and/or SMS.",
            required: true,
            version : 1
        },
        {
            key     : "community_directory",
            title   : "Community Directory (Optional)",
            content : "I agree to be listed in the Yukayeke member directory so other enrolled members from my region can connect with me.",
            required: false,
            version : 1
        },
        {
            key     : "evergreen_memory",
            title   : "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
            content : "I consent to have my ancestor's information added to the Evergreen Collective Memory, the tribally-governed Indigenous Archives of Puerto Rico. I understand this is a perpetual, community-stewarded archive maintained under the sovereignty of the Taino Nation, and that the information preserved will honor and record the memory of my ancestors for future generations.",
            required: false,
            version : 1
        }
    ];

    for (const consent of consents) {
        await prisma.consent.upsert({
            where: {
                key_version: {
                    key    : consent.key,
                    version: consent.version,
                }
            },
            update: {
                key     : consent.key,
                title   : consent.title,
                content : consent.content,
                required: consent.required,
                version : consent.version
            },
            create: {
                key     : consent.key,
                title   : consent.title,
                content : consent.content,
                required: consent.required,
                version : consent.version
            },
        });
    }
}