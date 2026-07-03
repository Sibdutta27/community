import { EnrollmentStatus, Sex } from '@/generated/prisma/enums';
import { Step1Service } from './step1.service';

describe('Step1Service.upsert (demographics only — no contact/address/emergency)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    const input = {
        firstName: 'Anani',
        lastName: 'Guarocuya',
        dateOfBirth: '1990-01-15',
        cityOfBirth: 'Ponce',
        municipalityOfBirth: 'Ponce',
        countryOfBirth: 'Puerto Rico',
        sex: 'FEMALE',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        occupation: 'Teacher',
        identity: 'TAINO',
        yucayeke: 'Guainía',
        yucayekeUnknown: false,
        hasChildren: true,
        hasMinorChildren: false,
    };

    function buildService() {
        const enrollment = {
            update: jest.fn().mockResolvedValue({}),
        };
        const contact = { upsert: jest.fn() };
        const address = { upsert: jest.fn() };
        const emergencyContact = { upsert: jest.fn(), deleteMany: jest.fn() };
        const tx = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue({
                    id: enrollmentId,
                    userId,
                    status: EnrollmentStatus.DRAFT,
                }),
                update: enrollment.update,
            },
            contact,
            address,
            emergencyContact,
        };
        const database = {
            $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
        };
        const enrollmentStepService = { markStepComplete: jest.fn() };
        const service = new Step1Service(
            database as never,
            enrollmentStepService as never,
        );
        return { service, tx, enrollment, contact, address, emergencyContact };
    }

    it('does not write Contact, Address or EmergencyContact', async () => {
        const { service, contact, address, emergencyContact } = buildService();

        await service.upsert(userId, input as never);

        expect(contact.upsert).not.toHaveBeenCalled();
        expect(address.upsert).not.toHaveBeenCalled();
        expect(emergencyContact.upsert).not.toHaveBeenCalled();
        expect(emergencyContact.deleteMany).not.toHaveBeenCalled();
    });

    it('persists only the demographic columns, including sex', async () => {
        const { service, enrollment } = buildService();

        await service.upsert(userId, input as never);

        const written = Object.assign(
            {},
            ...enrollment.update.mock.calls.map((c) => c[0].data),
        );

        expect(written.firstName).toBe('Anani');
        expect(written.lastName).toBe('Guarocuya');
        expect(written.sex).toBe(Sex.FEMALE);
        expect(written.occupation).toBe('Teacher');
        expect(written.yucayeke).toBe('Guainía');

        // dropped columns must never be written
        expect(written).not.toHaveProperty('middleName');
        expect(written).not.toHaveProperty('maternalLastName');
        expect(written).not.toHaveProperty('preferredName');
        expect(written).not.toHaveProperty('pronouns');
        expect(written).not.toHaveProperty('educationLevel');
        expect(written).not.toHaveProperty('languagesSpoken');
        expect(written).not.toHaveProperty('specialSkills');
    });
});

describe('Step1Service.saveDraft (partial draft — saves without completing)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    function buildService() {
        const update = jest.fn().mockResolvedValue({});
        const tx = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue({
                    id: enrollmentId,
                    userId,
                    status: EnrollmentStatus.DRAFT,
                }),
                update,
            },
        };
        const database = {
            $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
        };
        const enrollmentStepService = { markStepComplete: jest.fn() };
        const service = new Step1Service(
            database as never,
            enrollmentStepService as never,
        );
        return { service, update, enrollmentStepService };
    }

    it('persists only the provided fields', async () => {
        const { service, update } = buildService();

        const result = await service.saveDraft(userId, {
            firstName: 'Anani',
            occupation: 'Teacher',
            sex: 'FEMALE',
        } as never);

        expect(update).toHaveBeenCalledTimes(1);
        expect(update.mock.calls[0][0].data).toEqual({
            firstName: 'Anani',
            occupation: 'Teacher',
            sex: Sex.FEMALE,
        });
        expect(result).toEqual({ success: true });
    });

    it('does not write anything when the payload is empty', async () => {
        const { service, update } = buildService();

        const result = await service.saveDraft(userId, {} as never);

        expect(update).not.toHaveBeenCalled();
        expect(result).toEqual({ success: true });
    });

    it('never marks step 1 complete', async () => {
        const { service, enrollmentStepService } = buildService();

        await service.saveDraft(userId, { firstName: 'Anani' } as never);

        expect(enrollmentStepService.markStepComplete).not.toHaveBeenCalled();
    });
});

describe('Step1Service.getStep1 (draft prefill — not gated on completion)', () => {
    it('returns the saved fields even when step 1 is not completed', async () => {
        const database = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue({
                    id: 'enrollment-1',
                    userId: 'user-1',
                    status: EnrollmentStatus.DRAFT,
                    firstName: 'Anani',
                    lastName: null,
                    dateOfBirth: null,
                    cityOfBirth: null,
                    municipalityOfBirth: null,
                    countryOfBirth: null,
                    sex: null,
                    gender: null,
                    maritalStatus: null,
                    occupation: 'Teacher',
                    identity: null,
                    yucayeke: null,
                    yucayekeUnknown: null,
                    hasChildren: null,
                    hasMinorChildren: null,
                    steps: [{ stepNumber: 1, isCompleted: false }],
                }),
            },
        };
        const service = new Step1Service(
            database as never,
            { markStepComplete: jest.fn() } as never,
        );

        const result = await service.getStep1('user-1');

        expect(result.firstName).toBe('Anani');
        expect(result.occupation).toBe('Teacher');
        expect(result.lastName).toBeNull();
    });
});
