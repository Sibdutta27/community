import { Transform } from 'class-transformer';

export const EmptyToUndefined = () =>
    Transform(({ value }) =>
        value === '' ? undefined : value,
    );