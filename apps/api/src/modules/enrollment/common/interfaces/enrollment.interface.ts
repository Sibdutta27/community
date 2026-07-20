// ---------- Step 1: Demographics ----------
export interface Step1Demographics {
  firstName: string;
  lastName: string;

  dateOfBirth: Date;
  cityOfBirth: string;
  municipalityOfBirth: string;
  countryOfBirth: string;

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
}

// ---------- Ancestry (kinship) input ----------
// One kinship person captured in the maternal (step 2) or paternal (step 3) form.
export interface AncestryInput {
  name?: string;
  dateOfBirth?: Date | string; // only the parent (mother / father) exposes this
  nationality?: string;
  municipality?: string;
  yucayeke?: string;
  isBorikuaTaino?: boolean;
}
