import { DatabaseService } from '@/database/database.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Injectable()
export class ConsentService {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentService: EnrollmentService,

    ) {}

    /**
     * get all active consents. This function should be used to get all the active consents to show in the consent banner or to check if the user has accepted all the active consents or not.
     */
    public async getAllActiveConsents() {
        const consent = await this.database.consent.findMany({
            where: {
                active: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // map the consent to only return the required fields.
        return consent.map(({ id, key, title, content, required, version }) => ({
            id,
            key,
            title,
            content,
            required,
            version,
        }));
    }

    /**
     * get a consent by key and version. This function should be used to get a specific consent based on the key and version for the consent management page where we need to show the details of a particular consent.
     */
    public async getConsentByKeyAndVersion(key: string, version: number) {
        return this.database.consent.findUnique({
            where: {
                key_version: {
                    key,
                    version,
                },
            },
        });
    }

    /**
     * get the latest consent by key. This function should be used to get the latest consent for a particular key to show in the consent banner or to check if the user has accepted the latest consent or not.
     */
    public async getLatestConsentByKey(key: string) {
        return this.database.consent.findFirst({
            where: {
                key,
            },
            orderBy: {
                version: 'desc',
            },
        });
    }

    /**
     * get consents by ids. This function should be used to get consents by ids for the consent management page where we need to show the list of consents with their details.
     */
    public async getConsentsByIds(ids: string[]) {
        return this.database.consent.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    /**
     * Insert a new consent in db
     */
    public async insertConsent({ key, title, content, required, version }: { key: string; title: string; content: string; required: boolean; version: number }) {
        
        // find the consent based on the key and version
        const consent = await this.getConsentByKeyAndVersion(key, version);

        // if the consent already exists, throw an error
        if (consent) {
            throw new Error(`Consent with key ${key} and version ${version} already exists`);
        }
        
        return this.database.consent.create({
            data: {
                key,
                title,
                content,
                required,
                version,
            },
        });
    }

    /**
     * Update a consent by id. This function should not update the key and version of the consent as they are used to identify the consent and should not be changed.
     */
    public async updateConsent(id: string, { title, content, required, version }: { title?: string; content?: string; required?: boolean; version?: number }) {
        return this.database.consent.update({
            where: {
                id,
            },
            data: {
                title,
                content,
                required,
                version,
            },
        });
    }

    /**
     * Activate a consent by id.
     */
    public async activateConsent(id: string) {
        return this.database.consent.update({
            where: {
                id,
            },
            data: {
                active: true,
            },
        });
    }

    /**
     * Deactivate a consent by id.
     * This will not delete the consent but will make it inactive and not show up in the active consents list.
     */
    public async deactivateConsent(id: string) {
        return this.database.consent.update({
            where: {
                id,
            },
            data: {
                active: false,
            },
        });
    }

    /**
     * Delete a consent by id.
     * This function should not use.
     */
    private async deleteConsent(id: string) {
        return this.database.consent.delete({
            where: {
                id,
            },
        });
    }

    /**
     * Accept consent for enrollment purpose
     */
    public async acceptEnrollmentConsent(userId: string, { consentItemIds, acceptAll, acceptRequired }: { consentItemIds?: string[]; acceptAll?: boolean; acceptRequired?: boolean }) {
        
        // get the enrollment for the user
        const enrollment = await this.enrollmentService.getMinimalEnrollmentByUserId(userId);

        // Validate if enrollment exists
        if ( !enrollment ) {
            throw new NotFoundException('Enrollment not found for the user');
        }
        
        const enrollmentId = 'id' in enrollment ? enrollment.id : enrollment.enrollment.id;

        // get all active consents
        const activeConsents = await this.getAllActiveConsents();

        // variable to hold the consent ids that the user has accepted.
        // It will be initialized with the consentItemIds from the request body or an empty array if consentItemIds is undefined.
        let consentItemIdsToAccept: string[] = consentItemIds || [];

        // if acceptAll is true, then the user has accepted all the active consents
        if ( acceptAll ) {
            consentItemIdsToAccept = activeConsents.map(consent => consent.id);
        } else if ( acceptRequired ) {
            // if acceptRequired is true, then the user has accepted all the required consents
            consentItemIdsToAccept = activeConsents.filter(consent => consent.required).map(consent => consent.id);
        }

        // check if the user has accepted all the required consents
        const requiredConsentIds = activeConsents.filter(consent => consent.required).map(consent => consent.id);
        const hasAcceptedAllRequiredConsents = requiredConsentIds.every(requiredConsentId => consentItemIdsToAccept.includes(requiredConsentId));

        if ( !hasAcceptedAllRequiredConsents ) {
            throw new BadRequestException('User must accept all required consents');
        }

        // update the enrollment with the accepted consents
        await this.database.enrollmentConsent.createMany({
            data: consentItemIdsToAccept.map(consentId => ({
                enrollmentId,
                consentId: consentId,
                accepted: true,
            })),
            skipDuplicates: true,
        });

        // update the user's consentAccepted field to true if the user has accepted all the required consents
        if ( hasAcceptedAllRequiredConsents ) {
            await this.enrollmentService.updateEnrollment(enrollmentId, { consentAccepted: true });
        }

        return { success: true, message: 'Consents accepted successfully' };
    }
}
