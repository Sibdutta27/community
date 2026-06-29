import { Gender, MaritalStatus, PhoneType } from "@/generated/prisma/enums";

/**
 * GENDER_MAP: A mapping of string values from the DTO to the corresponding enum values in the database.
 */
const GENDER_MAP = {
    MALE             : Gender.MALE,
    FEMALE           : Gender.FEMALE,
    NON_BINARY       : Gender.NON_BINARY,
    TWO_SPIRIT       : Gender.TWO_SPIRIT,
    SELF_DESCRIBE    : Gender.SELF_DESCRIBE,
    PREFER_NOT_TO_SAY: Gender.PREFER_NOT_TO_SAY,
    OTHER            : Gender.OTHER,
};

/**
 * PHoNE_TYPE_MAP: A mapping of string values from the DTO to the corresponding enum values in the database.
 */
const PHONE_TYPE_MAP = {
    MOBILE: PhoneType.MOBILE,
    HOME  : PhoneType.HOME,
    WORK  : PhoneType.WORK,
};

/**
 * MARITAL_STATUS_MAP: A mapping of string values from the DTO to the corresponding enum values in the database.
 */
const MARITAL_STATUS_MAP = {
    SINGLE  : MaritalStatus.SINGLE,
    MARRIED : MaritalStatus.MARRIED,
    DIVORCED: MaritalStatus.DIVORCED,
    WIDOWED : MaritalStatus.WIDOWED,
};

export { GENDER_MAP, PHONE_TYPE_MAP, MARITAL_STATUS_MAP };

/**
 * mapGender: A utility function that takes a string input and returns the corresponding Gender enum value.
 * It throws an error if the input is invalid or not provided.
 */
export function mapGender(genderStr: string): Gender {

    if ( !genderStr ) {
        throw new Error('Gender is required');
    }

    const gender = GENDER_MAP[genderStr.toUpperCase()];
    if (!gender) {
        throw new Error(`Invalid gender value: ${genderStr}`);
    }
    return gender;
}

/**
 * mapPhoneType: A utility function that takes a string input and returns the corresponding PhoneType enum value.
 * It defaults to MOBILE if the input is not provided, and throws an error if the input is invalid.
 */
export function mapPhoneType(phoneTypeStr: string): PhoneType {

    if ( !phoneTypeStr ) {
        return PHONE_TYPE_MAP.MOBILE; // Default to MOBILE if not provided
    }

    const phoneType = PHONE_TYPE_MAP[phoneTypeStr.toUpperCase()];
    if (!phoneType) {
        throw new Error(`Invalid phone type value: ${phoneTypeStr}`);
    }
    return phoneType;
}

/**
 * mapMaritalStatus: A utility function that takes a string input and returns the corresponding MaritalStatus enum value.
 * It defaults to SINGLE if the input is not provided, and throws an error if the input is invalid.
 */
export function mapMaritalStatus(maritalStatusStr: string | undefined): MaritalStatus {

    if ( !maritalStatusStr ) {
        return MARITAL_STATUS_MAP.SINGLE; // Default to SINGLE if not provided
    }

    const maritalStatus = MARITAL_STATUS_MAP[maritalStatusStr.toUpperCase()];
    if (!maritalStatus) {
        throw new Error(`Invalid marital status value: ${maritalStatusStr}`);
    }
    return maritalStatus;
}