import {
    AdditionalInfo,
    Address,
    BirthInfo,
    Contact,
    EmergencyContact,
    Gender,
    LegalName,
    YucayekeInfo
} from "@/modules/enrollment/common/interfaces/enrollment.interface";

export interface Step1 {
  legalName       : LegalName;
  birthInfo       : BirthInfo;
  gender          : Gender;
  contact         : Contact;
  currentAddress  : Address;
  mailingAddress  : Address;
  emergencyContact: EmergencyContact;
  additionalInfo  : AdditionalInfo;
  yucayekeInfo?   : YucayekeInfo;
}