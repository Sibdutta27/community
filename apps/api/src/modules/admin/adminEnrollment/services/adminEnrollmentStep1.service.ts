import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { AddressType } from '@/generated/prisma/enums';

@Injectable()
export class AdminEnrollmentStep1Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all step 1 data for the user's enrollment.
     */
    public async getStep1(enrollmentId: string) {

        // Get the enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { id: enrollmentId },
            include: {
                contact: true,
                addresses: true,
                emergencyContact: true,
                steps: true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if (enrollment.steps.length === 0) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if (!enrollment.steps.find(step => step.stepNumber == 1)?.isCompleted) {
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
                firstName: enrollment.firstName,
                middleName: enrollment.middleName,
                lastName: enrollment.lastName,
                maternalLastName: enrollment.maternalLastName,
                preferredName: enrollment.preferredName,
            },

            birthInfo: {
                dateOfBirth: enrollment.dateOfBirth,
                cityOfBirth: enrollment.cityOfBirth,
                municipalityOfBirth: enrollment.municipalityOfBirth,
                countryOfBirth: enrollment.countryOfBirth,
            },

            gender: {
                gender: enrollment.gender,
                pronouns: enrollment.pronouns,
            },

            contact: enrollment.contact
                ? {
                    email: enrollment.contact.email,
                    phoneNumber: enrollment.contact.phoneNumber,
                    phoneType: enrollment.contact.phoneType,
                    allowSMS: enrollment.contact.allowSMS,
                }
                : null,

            currentAddress: currentAddress
                ? {
                    street: currentAddress.street,
                    city: currentAddress.city,
                    state: currentAddress.state,
                    zipCode: currentAddress.zipCode,
                    country: currentAddress.country,
                }
                : null,

            mailingAddress: mailingAddress
                ? {
                    street: mailingAddress.street,
                    city: mailingAddress.city,
                    state: mailingAddress.state,
                    zipCode: mailingAddress.zipCode,
                    country: mailingAddress.country,
                }
                : null,

            emergencyContact: enrollment.emergencyContact
                ? {
                    fullName: enrollment.emergencyContact.fullName,
                    relationship: enrollment.emergencyContact.relationship,
                    phoneNumber: enrollment.emergencyContact.phoneNumber,
                }
                : null,

            additionalInfo: {
                maritalStatus: enrollment.maritalStatus,
                occupation: enrollment.occupation,
                educationLevel: enrollment.educationLevel,
                languagesSpoken: enrollment.languagesSpoken,
                specialSkills: enrollment.specialSkills,
            },

            yucayekeInfo: {
                identity: enrollment.identity,
                yucayeke: enrollment.yucayeke,
                yucayekeUnknown: enrollment.yucayekeUnknown,
                hasChildren: enrollment.hasChildren,
                hasMinorChildren: enrollment.hasMinorChildren,
            },

            signature: {
                signatureName: enrollment.signatureName,
                signatureDate: enrollment.signatureDate,
                agreedToTerms: enrollment.agreedToTerms,
            },
        };
    }
}
