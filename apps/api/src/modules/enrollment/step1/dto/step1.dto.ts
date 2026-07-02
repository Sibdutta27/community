import {
    IsEmail,
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsDate,
    IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Identity } from '@/generated/prisma/enums';

// ---------- Legal Name ----------
class LegalNameDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    maternalLastName?: string;

    @IsString()
    @IsOptional()
    preferredName?: string;
}

// ---------- Birth Info ----------
class BirthInfoDto {
    @Type(() => Date)   // auto convert string → Date
    @IsDate()           // validate it's a valid Date
    dateOfBirth: Date;

    @IsString()
    @IsNotEmpty()
    cityOfBirth: string;

    @IsString()
    @IsNotEmpty()
    municipalityOfBirth: string;

    @IsString()
    @IsNotEmpty()
    countryOfBirth: string;
}

// ---------- Gender ----------
class GenderDto {
    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsString()
    @IsOptional()
    pronouns?: string;
}

// ---------- Contact ----------
class ContactDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    phoneType: string;

    @IsBoolean()
    @IsOptional()
    allowSMS?: boolean;
}

// ---------- Address ----------
class AddressDto {
    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsOptional()
    apartment?: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsOptional()
    yearsLived: string;
}

// ---------- Emergency Contact ----------
class EmergencyContactDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    relationship: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

// ---------- Additional Info ----------
class AdditionalInfoDto {
    @IsString()
    @IsOptional()
    maritalStatus?: string;

    @IsString()
    @IsOptional()
    occupation?: string;

    @IsString()
    @IsOptional()
    educationLevel?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    languagesSpoken?: string[];

    @IsString()
    @IsOptional()
    specialSkills?: string;
}

// ---------- Yucayeke Information ----------
class YucayekeInfoDto {
    @IsEnum(Identity)
    @IsOptional()
    identity?: Identity;

    @IsString()
    @IsOptional()
    yucayeke?: string;

    @IsBoolean()
    @IsOptional()
    yucayekeUnknown?: boolean;

    @IsBoolean()
    @IsOptional()
    hasChildren?: boolean;

    @IsBoolean()
    @IsOptional()
    hasMinorChildren?: boolean;
}

export class Step1Dto {
    @ValidateNested()
    @Type(() => LegalNameDto)
    legalName: LegalNameDto;

    @ValidateNested()
    @Type(() => BirthInfoDto)
    birthInfo: BirthInfoDto;

    @ValidateNested()
    @Type(() => GenderDto)
    gender: GenderDto;

    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @ValidateNested()
    @Type(() => AddressDto)
    currentAddress: AddressDto;

    @ValidateNested()
    @Type(() => AddressDto)
    mailingAddress: AddressDto;

    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact: EmergencyContactDto;

    @ValidateNested()
    @Type(() => AdditionalInfoDto)
    additionalInfo: AdditionalInfoDto;

    @ValidateNested()
    @Type(() => YucayekeInfoDto)
    @IsOptional()
    yucayekeInfo?: YucayekeInfoDto;
}