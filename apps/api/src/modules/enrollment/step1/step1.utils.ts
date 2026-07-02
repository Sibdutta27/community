import { BadRequestException } from "@nestjs/common";
import { Gender, Identity, MaritalStatus, Sex } from "@/generated/prisma/enums";

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
 * SEX_MAP: A mapping of string values from the DTO to the corresponding Sex enum values in the database.
 */
const SEX_MAP = {
    MALE             : Sex.MALE,
    FEMALE           : Sex.FEMALE,
    INTERSEX         : Sex.INTERSEX,
    PREFER_NOT_TO_SAY: Sex.PREFER_NOT_TO_SAY,
};

/**
 * MARITAL_STATUS_MAP: A mapping of string values from the DTO to the corresponding enum values in the database.
 */
const MARITAL_STATUS_MAP = {
    SINGLE              : MaritalStatus.SINGLE,
    MARRIED             : MaritalStatus.MARRIED,
    DIVORCED            : MaritalStatus.DIVORCED,
    WIDOWED             : MaritalStatus.WIDOWED,
    DOMESTIC_PARTNERSHIP: MaritalStatus.DOMESTIC_PARTNERSHIP,
};

/**
 * IDENTITY_MAP: A mapping of string values from the DTO to the corresponding Identity enum values in the database.
 */
const IDENTITY_MAP = {
    ARAWAK  : Identity.ARAWAK,
    KALINAGO: Identity.KALINAGO,
    GARIFUNA: Identity.GARIFUNA,
    TAINO   : Identity.TAINO,
};

export { GENDER_MAP, SEX_MAP, MARITAL_STATUS_MAP, IDENTITY_MAP };

/**
 * mapGender: A utility function that takes a string input and returns the corresponding Gender enum value.
 * The field is optional, so it returns undefined when no value is provided, and throws an error if the input is invalid.
 */
export function mapGender(genderStr: string | undefined | null): Gender | undefined {

    if ( !genderStr ) {
        return undefined; // Optional field — leave unset if not provided
    }

    const gender = GENDER_MAP[genderStr.toUpperCase()];
    if (!gender) {
        throw new BadRequestException(`Invalid gender value: ${genderStr}`);
    }
    return gender;
}

/**
 * mapSex: A utility function that takes a string input and returns the corresponding Sex enum value.
 * The field is optional, so it returns undefined when no value is provided, and throws an error if the input is invalid.
 */
export function mapSex(sexStr: string | undefined | null): Sex | undefined {

    if ( !sexStr ) {
        return undefined; // Optional field — leave unset if not provided
    }

    const sex = SEX_MAP[sexStr.toUpperCase()];
    if (!sex) {
        throw new BadRequestException(`Invalid sex value: ${sexStr}`);
    }
    return sex;
}

/**
 * mapMaritalStatus: A utility function that takes a string input and returns the corresponding MaritalStatus enum value.
 * The field is optional, so it returns undefined when no value is provided, and throws an error if the input is invalid.
 */
export function mapMaritalStatus(maritalStatusStr: string | undefined | null): MaritalStatus | undefined {

    if ( !maritalStatusStr ) {
        return undefined; // Optional field — leave unset if not provided
    }

    const maritalStatus = MARITAL_STATUS_MAP[maritalStatusStr.toUpperCase()];
    if (!maritalStatus) {
        throw new BadRequestException(`Invalid marital status value: ${maritalStatusStr}`);
    }
    return maritalStatus;
}

/**
 * mapIdentity: A utility function that takes a string input and returns the corresponding Identity enum value.
 * The field is optional, so it returns undefined when no value is provided, and throws an error if the input is invalid.
 */
export function mapIdentity(identityStr: string | undefined | null): Identity | undefined {

    if ( !identityStr ) {
        return undefined; // Optional field — leave unset if not provided
    }

    const identity = IDENTITY_MAP[identityStr.toUpperCase()];
    if (!identity) {
        throw new BadRequestException(`Invalid identity value: ${identityStr}`);
    }
    return identity;
}