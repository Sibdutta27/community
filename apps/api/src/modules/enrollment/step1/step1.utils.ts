import { BadRequestException } from "@nestjs/common";
import { Gender, Identity, MaritalStatus, Sex } from "@/generated/prisma/enums";

/**
 * GENDER_MAP: A mapping of string values from the DTO to the corresponding enum values in the database.
 * Client spec 2026-07-08: Woman / Man / Two-Spirit / Self-describe. When the client
 * sends the Arawak-language term for Two-Spirit, add the enum value + this map entry
 * (plus the web option arrays and en/es messages).
 */
const GENDER_MAP = {
    WOMAN        : Gender.WOMAN,
    MAN          : Gender.MAN,
    TWO_SPIRIT   : Gender.TWO_SPIRIT,
    SELF_DESCRIBE: Gender.SELF_DESCRIBE,
};

/**
 * SEX_MAP: A mapping of string values from the DTO to the corresponding Sex enum values in the database.
 * The field is optional — leaving it unset covers "prefer not to say".
 */
const SEX_MAP = {
    MALE    : Sex.MALE,
    FEMALE  : Sex.FEMALE,
    INTERSEX: Sex.INTERSEX,
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
/**
 * buildGenderSelfDescribeDraft: the free text is only meaningful alongside
 * SELF_DESCRIBE — changing gender to any other value clears it; omitting both
 * fields leaves it untouched (draft semantics).
 */
function buildGenderSelfDescribeDraft(gender: string | undefined, genderSelfDescribe: string | undefined) {
    if (gender !== undefined && mapGender(gender) !== Gender.SELF_DESCRIBE) {
        return { genderSelfDescribe: null };
    }

    if (genderSelfDescribe !== undefined) {
        return { genderSelfDescribe };
    }

    return {};
}

/**
 * buildStep1DraftData: builds the partial Enrollment update payload for a
 * Step 1 draft save — only the fields present on the input are included, so
 * an omitted field never overwrites a previously saved value.
 */
export function buildStep1DraftData(input: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    cityOfBirth?: string;
    municipalityOfBirth?: string;
    countryOfBirth?: string;
    sex?: string;
    gender?: string;
    genderSelfDescribe?: string;
    maritalStatus?: string;
    occupation?: string;
    identity?: string;
    yucayeke?: string;
    yucayekeUnknown?: boolean;
    hasChildren?: boolean;
    hasMinorChildren?: boolean;
}) {
    return {
        ...(input.firstName           !== undefined ? { firstName          : input.firstName } : {}),
        ...(input.lastName            !== undefined ? { lastName           : input.lastName } : {}),
        ...(input.dateOfBirth         !== undefined ? { dateOfBirth        : input.dateOfBirth } : {}),
        ...(input.cityOfBirth         !== undefined ? { cityOfBirth        : input.cityOfBirth } : {}),
        ...(input.municipalityOfBirth !== undefined ? { municipalityOfBirth: input.municipalityOfBirth } : {}),
        ...(input.countryOfBirth      !== undefined ? { countryOfBirth     : input.countryOfBirth } : {}),
        ...(input.sex                 !== undefined ? { sex                : mapSex(input.sex) } : {}),
        ...(input.gender              !== undefined ? { gender             : mapGender(input.gender) } : {}),
        ...buildGenderSelfDescribeDraft(input.gender, input.genderSelfDescribe),
        ...(input.maritalStatus       !== undefined ? { maritalStatus      : mapMaritalStatus(input.maritalStatus) } : {}),
        ...(input.occupation          !== undefined ? { occupation         : input.occupation } : {}),
        ...(input.identity            !== undefined ? { identity           : mapIdentity(input.identity) } : {}),
        ...(input.yucayeke            !== undefined ? { yucayeke           : input.yucayeke } : {}),
        ...(input.yucayekeUnknown     !== undefined ? { yucayekeUnknown    : input.yucayekeUnknown } : {}),
        ...(input.hasChildren         !== undefined ? { hasChildren        : input.hasChildren } : {}),
        ...(input.hasMinorChildren    !== undefined ? { hasMinorChildren   : input.hasMinorChildren } : {}),
    };
}
