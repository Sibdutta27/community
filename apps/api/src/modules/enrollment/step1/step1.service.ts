import { Prisma } from '@/generated/prisma/client';
import { AddressType, EnrollmentStatus } from '@/generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { mapGender, mapIdentity, mapMaritalStatus, mapPhoneType } from './step1.utils';
import { Step1 } from './interface/step1.interface';

@Injectable()
export class Step1Service {

    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,
    ) { }

    /**
     * upsert: Upserts the Step 1 data into the database for the user's enrollment.
     */
    public async upsert(userId: string, step1Input: Step1) {


        return await this.database.$transaction(async (tx) => {

            // Find enrollment
            const enrollment = await tx.enrollment.findFirst({
                where: { userId },
            });

            // Validate enrollment exists
            if (!enrollment) {
                throw new BadRequestException('Enrollment not started');
            }

            // Validate enrollment is in DRAFT status
            if (enrollment.status !== EnrollmentStatus.DRAFT) {
                throw new BadRequestException('Enrollment is not in draft status');
            }

            /**
             * Start upserting the step1 fields
             */

            // Upsert legal name
            await this.upsertLegalName(tx, enrollment.id, step1Input.legalName);

            // Upsert birth info
            await this.upsertBirthInfo(tx, enrollment.id, step1Input.birthInfo);

            // Upsert gender info
            await this.upsertGenderInfo(tx, enrollment.id, step1Input.gender);

            // Upsert contact info
            await this.upsertContactInfo(tx, enrollment.id, step1Input.contact);

            // Upsert current address
            await this.upsertAddressInfo(tx, enrollment.id, step1Input.currentAddress, AddressType.CURRENT);

            // Upsert mailing address
            await this.upsertAddressInfo(tx, enrollment.id, step1Input.mailingAddress, AddressType.MAILING);

            // Upsert emergency contact info
            await this.upsertEmergencyContact(tx, enrollment.id, step1Input.emergencyContact);

            // Upsert additional info
            await this.upsertAdditionalInfo(tx, enrollment.id, step1Input.additionalInfo);

            // Upsert yucayeke info (identity + yucayeke + children)
            await this.upsertYucayekeInfo(tx, enrollment.id, step1Input.yucayekeInfo);

            /**
             * Update the step number
             */
            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 1);

            // Return updated enrollment
            return {
                success: true,
            };
        });
    }

    /**
     * upsertLegalName: Helper function to upsert legal name data into the database for Step 1.
     */
    private async upsertLegalName(tx: Prisma.TransactionClient, enrollmentId: string, legalName: Step1['legalName']) {
        return tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
                firstName: legalName.firstName,
                middleName: legalName.middleName,
                lastName: legalName.lastName,
                maternalLastName: legalName.maternalLastName,
                preferredName: legalName.preferredName,
            },
        });
    }

    /**
     * upsertBirthInfo: Helper function to upsert birth info into the database for step 1.
     */
    private async upsertBirthInfo(tx: Prisma.TransactionClient, enrollmentId: string, birthInfo: Step1['birthInfo']) {
        return tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
                dateOfBirth: birthInfo.dateOfBirth,
                cityOfBirth: birthInfo.cityOfBirth,
                municipalityOfBirth: birthInfo.municipalityOfBirth,
                countryOfBirth: birthInfo.countryOfBirth,
            },
        });
    }

    /**
     * upsertGenderInfo: Helper function to upsert gender info into the database for step 1.
     */
    private async upsertGenderInfo(tx: Prisma.TransactionClient, enrollmentId: string, genderInfo: Step1['gender']) {
        return tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
                gender: mapGender(genderInfo.gender),
                pronouns: genderInfo.pronouns,
            },
        });
    }

    /**
     * upsertContactInfo: Helper function to upsert contact info into the database for step 1.
     */
    private async upsertContactInfo(tx: Prisma.TransactionClient, enrollmentId: string, contactInfo: Step1['contact']) {

        return tx.contact.upsert({
            where: { enrollmentId },
            update: {
                email: contactInfo.email,
                phoneNumber: contactInfo.phoneNumber,
                phoneType: mapPhoneType(contactInfo.phoneType),
                allowSMS: contactInfo.allowSMS,
            },
            create: {
                enrollmentId,
                email: contactInfo.email,
                phoneNumber: contactInfo.phoneNumber,
                phoneType: mapPhoneType(contactInfo.phoneType),
                allowSMS: contactInfo.allowSMS,
            },
        });
    }

    /**
     * upsertAddressInfo: Helper function to upsert address info into the database for step 1.
     * The addressType parameter is used to differentiate between current and permanent addresses.
     */
    private async upsertAddressInfo(tx: Prisma.TransactionClient, enrollmentId: string, addressInfo: Step1['currentAddress'], addressType: AddressType) {

        return tx.address.upsert({
            where: {
                enrollmentId_type: {
                    enrollmentId,
                    type: addressType,
                },
            },
            update: {
                street: addressInfo.street,
                city: addressInfo.city,
                state: addressInfo.state,
                zipCode: addressInfo.zipCode,
                country: addressInfo.country,
            },
            create: {
                enrollmentId,
                type: addressType,
                street: addressInfo.street,
                city: addressInfo.city,
                state: addressInfo.state,
                zipCode: addressInfo.zipCode,
                country: addressInfo.country,
            },
        });
    }

    /**
     * upsertEmergencyContact: Helper function to upsert emergency contact info into the database for step 1.
     */
    private async upsertEmergencyContact(tx: Prisma.TransactionClient, enrollmentId: string, emergencyContact: Step1['emergencyContact']) {

        // Delete existing emergency contact for the enrollment (if any) before inserting the new one, since there should only be one emergency contact per enrollment
        await tx.emergencyContact.deleteMany({
            where: { enrollmentId },
        });

        return tx.emergencyContact.upsert({
            where: { enrollmentId },
            update: {
                fullName: emergencyContact.fullName,
                relationship: emergencyContact.relationship,
                phoneNumber: emergencyContact.phoneNumber,
            },
            create: {
                enrollmentId,
                fullName: emergencyContact.fullName,
                relationship: emergencyContact.relationship,
                phoneNumber: emergencyContact.phoneNumber,
            },
        });
    }

    /** 
     * upsertAdditionalInfo: Helper function to upsert additional info into the database for step 1.
     */
    private async upsertAdditionalInfo(tx: Prisma.TransactionClient, enrollmentId: string, additionalInfo: Step1['additionalInfo']) {

        return tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
                maritalStatus: mapMaritalStatus(additionalInfo.maritalStatus),
                occupation: additionalInfo.occupation,
                educationLevel: additionalInfo.educationLevel,
                languagesSpoken: additionalInfo.languagesSpoken,
                specialSkills: additionalInfo.specialSkills,
            },
        });
    }

    /**
     * upsertYucayekeInfo: Helper function to upsert yucayeke info (identity, yucayeke, children) for step 1.
     * All fields are optional; only the provided values are written.
     */
    private async upsertYucayekeInfo(tx: Prisma.TransactionClient, enrollmentId: string, yucayekeInfo: Step1['yucayekeInfo']) {

        return tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
                identity        : mapIdentity(yucayekeInfo?.identity),
                yucayeke        : yucayekeInfo?.yucayeke,
                yucayekeUnknown : yucayekeInfo?.yucayekeUnknown,
                hasChildren     : yucayekeInfo?.hasChildren,
                hasMinorChildren: yucayekeInfo?.hasMinorChildren,
            },
        });
    }

    /**
     * Get all step 1 data for the user's enrollment.
     */
    public async getStep1(userId: string) {

        // Get the enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: {
                contact         : true,
                addresses       : true,
                emergencyContact: true,
                steps           : true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if ( enrollment.steps.length === 0 ) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if ( ! enrollment.steps.find(step => step.stepNumber == 1 )?.isCompleted ) {
            throw new BadRequestException('Step 1 not completed yet');
        }

        // Extract addresses
        const currentAddress = enrollment.addresses.find(
            addr => addr.type === AddressType.CURRENT
        );

        const mailingAddress = enrollment.addresses.find(
            addr => addr.type === AddressType.MAILING
        );

        return {
            legalName: {
                firstName       : enrollment.firstName,
                middleName      : enrollment.middleName,
                lastName        : enrollment.lastName,
                maternalLastName: enrollment.maternalLastName,
                preferredName   : enrollment.preferredName,
            },

            birthInfo: {
                dateOfBirth        : enrollment.dateOfBirth,
                cityOfBirth        : enrollment.cityOfBirth,
                municipalityOfBirth: enrollment.municipalityOfBirth,
                countryOfBirth     : enrollment.countryOfBirth,
            },

            gender: {
                gender  : enrollment.gender,
                pronouns: enrollment.pronouns,
            },

            contact: enrollment.contact
                ? {
                    email      : enrollment.contact.email,
                    phoneNumber: enrollment.contact.phoneNumber,
                    phoneType  : enrollment.contact.phoneType,
                    allowSMS   : enrollment.contact.allowSMS,
                }
                : null,

            currentAddress: currentAddress
                ? {
                    street : currentAddress.street,
                    city   : currentAddress.city,
                    state  : currentAddress.state,
                    zipCode: currentAddress.zipCode,
                    country: currentAddress.country,
                }
                : null,

            mailingAddress: mailingAddress
                ? {
                    street : mailingAddress.street,
                    city   : mailingAddress.city,
                    state  : mailingAddress.state,
                    zipCode: mailingAddress.zipCode,
                    country: mailingAddress.country,
                }
                : null,

            emergencyContact: enrollment.emergencyContact
                ? {
                    fullName    : enrollment.emergencyContact.fullName,
                    relationship: enrollment.emergencyContact.relationship,
                    phoneNumber : enrollment.emergencyContact.phoneNumber,
                }
                : null,

            additionalInfo: {
                maritalStatus  : enrollment.maritalStatus,
                occupation     : enrollment.occupation,
                educationLevel : enrollment.educationLevel,
                languagesSpoken: enrollment.languagesSpoken,
                specialSkills  : enrollment.specialSkills,
            },

            yucayekeInfo: {
                identity        : enrollment.identity,
                yucayeke        : enrollment.yucayeke,
                yucayekeUnknown : enrollment.yucayekeUnknown,
                hasChildren     : enrollment.hasChildren,
                hasMinorChildren: enrollment.hasMinorChildren,
            },
        };
    }
}
