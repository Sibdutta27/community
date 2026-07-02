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
