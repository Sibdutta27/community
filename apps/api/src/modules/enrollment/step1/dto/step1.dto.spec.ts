import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Step1Dto } from './step1.dto';

function buildValidBody(): Record<string, unknown> {
    return {
        firstName          : 'Ana',
        lastName           : 'Rivera',
        dateOfBirth        : '1990-05-12T00:00:00.000Z',
        cityOfBirth        : 'San Juan',
        municipalityOfBirth: 'San Juan',
        countryOfBirth     : 'Puerto Rico',
    };
}

async function validateBody(overrides: Record<string, unknown>) {
    const dto = plainToInstance(Step1Dto, { ...buildValidBody(), ...overrides });
    return validate(dto);
}

describe('Step1Dto enum validation', () => {
    it('accepts a body without the optional enum fields', async () => {
        const errors = await validateBody({});
        expect(errors).toHaveLength(0);
    });

    it('accepts valid sex / gender / maritalStatus enum values', async () => {
        const errors = await validateBody({
            sex          : 'FEMALE',
            gender       : 'TWO_SPIRIT',
            maritalStatus: 'DOMESTIC_PARTNERSHIP',
        });
        expect(errors).toHaveLength(0);
    });

    it('rejects an invalid sex value at the DTO layer', async () => {
        const errors = await validateBody({ sex: 'NOT_A_SEX' });
        expect(errors.some((error) => error.property === 'sex')).toBe(true);
    });

    it('rejects an invalid gender value at the DTO layer', async () => {
        const errors = await validateBody({ gender: 'NOT_A_GENDER' });
        expect(errors.some((error) => error.property === 'gender')).toBe(true);
    });

    it('rejects an invalid maritalStatus value at the DTO layer', async () => {
        const errors = await validateBody({ maritalStatus: 'COMPLICATED' });
        expect(
            errors.some((error) => error.property === 'maritalStatus'),
        ).toBe(true);
    });
});
