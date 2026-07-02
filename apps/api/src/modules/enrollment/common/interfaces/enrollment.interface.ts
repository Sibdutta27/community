import { LivingStatus, RelationType } from "@/generated/prisma/enums";

// ---------- Legal Name ----------
export interface LegalName {
  firstName: string;
  middleName?: string;
  lastName: string;
  maternalLastName?: string;
  preferredName?: string;
}

// ---------- Birth Info ----------
export interface BirthInfo {
  dateOfBirth: Date;
  cityOfBirth: string;
  municipalityOfBirth: string;
  countryOfBirth: string;
}

// ---------- Gender ----------
export interface Gender {
  gender: string;
  pronouns?: string;
}

// ---------- Contact ----------
export interface Contact {
  email: string;
  phoneNumber: string;
  phoneType: string;
  allowSMS?: boolean;
}

// ---------- Address ----------
export interface Address {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  yearsLived?: string;
}

// ---------- Emergency Contact ----------
export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phoneNumber: string;
}

// ---------- Additional Info ----------
export interface AdditionalInfo {
  maritalStatus?: string;
  occupation?: string;
  educationLevel?: string;
  languagesSpoken?: string[];
  specialSkills?: string;
}

// ---------- Yucayeke Information ----------
export interface YucayekeInfo {
  identity?: string;
  yucayeke?: string;
  yucayekeUnknown?: boolean;
  hasChildren?: boolean;
  hasMinorChildren?: boolean;
}

// ---------- Maternal Lineage ----------
export interface MaternalLineage {
  id?: string;
  relation: RelationType;
  fullName: string;
  maidenName?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  livingStatus: LivingStatus;
  approximateBirthYear?: number;
  regionOfOrigin?: string;
  familyOccupation?: string;
  additionalNotes?: string;
}