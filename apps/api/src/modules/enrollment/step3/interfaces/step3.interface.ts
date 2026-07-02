import { AncestryInput } from '@/modules/enrollment/common/interfaces/enrollment.interface';

// Step 3 — Paternal Kinship.
export interface Step3 {
  father: AncestryInput;
  paternalGrandmother: AncestryInput;
  paternalGrandfather: AncestryInput;
}
