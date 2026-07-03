import { AncestryInput } from '@/modules/enrollment/common/interfaces/enrollment.interface';

// Step 2 — Maternal Kinship.
export interface Step2 {
  mother: AncestryInput;
  maternalGrandmother: AncestryInput;
  maternalGrandfather: AncestryInput;
}

// Partial draft ("Save & finish later") — every ancestor optional.
export type Step2SaveDraft = Partial<Step2>;
