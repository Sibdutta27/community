// interfaces/createConsent.interface.ts

export interface CreateConsentInterface {
    key: string;
    version: number;

    title: string;
    content: string;

    required?: boolean;
    active?: boolean;
}