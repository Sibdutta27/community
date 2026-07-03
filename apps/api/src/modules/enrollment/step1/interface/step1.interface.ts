import { Step1Demographics } from '@/modules/enrollment/common/interfaces/enrollment.interface';

export type Step1 = Step1Demographics;

// Partial draft ("Save & finish later") — every field optional.
export type Step1SaveDraft = Partial<Step1Demographics>;
