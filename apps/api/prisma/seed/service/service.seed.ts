/**
 * Seed the service table with default values if they don't already exist.
 */

import { ServiceStatus } from "../../../src/generated/prisma/enums";
import { prisma } from "../seed";

export async function seedService() {
    console.log("START SEEDING SERVICES...")

    // If there are no service categories, we can't seed services as they depend on categories
    const categoryCount = await prisma.serviceCategory.count();
    if (categoryCount === 0) {
        console.warn("No service categories found. Please seed service categories before seeding services.");
        return;
    }

    // If there are already services, we can skip seeding to avoid duplicates
    const serviceCount = await prisma.service.count();
    if (serviceCount > 0) {
        console.log("Services already exist. Skipping seeding services.");
        return;
    }

    // Get the service categories to link with services
    const serviceCategories = await prisma.serviceCategory.findMany();


    const services = [
        {
            name       : "Tribal Health Clinic",
            description: "Primary care, preventive medicine, and traditional healing services for tribal members and families.",
            icon       : "health_clinic",
            categoryId : serviceCategories.find(category => category.key === "health")?.id!,
            status     : ServiceStatus.INACTIVE,
            location   : "123 Tribal Health Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@tribalhealthclinic.com",
            actionLabel: "Schedule Appointment",
            actionUrl  : "https://tribalhealthclinic.com/schedule",
            highlights : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Legal Aid Services",
            description: "Free legal consultation, advocacy, and representation for tribal members in various matters.",
            icon       : "legal_aid",
            categoryId : serviceCategories.find(category => category.key === "legal")?.id!,
            status     : ServiceStatus.INACTIVE,
            location   : "123 Legal Aid Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@legalaid.com",
            actionLabel: "Request Consultation",
            actionUrl  : "https://legalaid.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Primary Care Physicians",
            description: "Primary care, preventive medicine, and traditional healing services for tribal members and families.",
            icon       : "primary_care",
            categoryId : serviceCategories.find(category => category.key === "health")?.id!,
            status     : ServiceStatus.ACTIVE,
            location   : "123 Primary Care, Reservationville",
            phone      : "555-123-4567",
            email      : "info@primarycare.com",
            actionLabel: "Contact Us",
            actionUrl  : "https://primarycare.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Dental Care",
            description: "Comprehensive dental services including cleanings, fillings, extractions, and oral health education for tribal members.",
            icon       : "dental_care",
            categoryId : serviceCategories.find(category => category.key === "health")?.id!,
            status     : ServiceStatus.ACTIVE,
            location   : "123 Dental Care Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@dentalcare.com",
            actionLabel: "Request Appointment",
            actionUrl  : "https://dentalcare.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Mental Health Counseling",
            description: "Mental health counseling, therapy, and support groups for tribal members dealing with stress, trauma, and other mental health concerns.",
            icon       : "mental_health",
            categoryId : serviceCategories.find(category => category.key === "health")?.id!,
            status     : ServiceStatus.ACTIVE,
            location   : "123 Mental Health Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@mentalhealth.com",
            actionLabel: "Request Consultation",
            actionUrl  : "https://mentalhealth.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Family Law Services",
            description: "Family law services, including legal advice, representation, and support for tribal members facing family-related legal issues.",
            icon       : "family_law",
            categoryId : serviceCategories.find(category => category.key === "legal")?.id!,
            status     : ServiceStatus.ACTIVE,
            location   : "123 Family Law Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@familylaw.com",
            actionLabel: "Request Consultation",
            actionUrl  : "https://familylaw.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
        {
            name       : "Housing & Property Rights",
            description: "Housing and property rights services for tribal members, including legal advice and representation.",
            icon       : "housing_property",
            categoryId : serviceCategories.find(category => category.key === "legal")?.id!,
            status     : ServiceStatus.ACTIVE,
            location   : "123 Housing & Property Rights Rd, Reservationville",
            phone      : "555-123-4567",
            email      : "info@housingproperty.com",
            actionLabel: "Request Consultation",
            actionUrl  : "https://housingproperty.com/schedule",
            highlights  : ["Open Now", "Accepting New Patients", "Mon-Fri: 8AM-6PM"],
        },
    ];

    await prisma.service.createMany({
        data          : services,
        skipDuplicates: true,
    });
}
            