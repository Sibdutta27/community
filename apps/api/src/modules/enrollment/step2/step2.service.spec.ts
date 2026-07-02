import { EnrollmentStatus, AncestryRelation } from '@/generated/prisma/enums';
import { Step2Service } from './step2.service';

describe('Step2Service.upsert (maternal kinship → Ancestry rows)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    const input = {
        mother: {
            name: 'Anacaona',
            dateOfBirth: '1950-04-01',
            nationality: 'Puerto Rican',
            municipality: 'Jayuya',
            yucayeke: 'Guainía',
            isBorikuaTaino: true,
        },
        maternalGrandmother: {
            name: 'Yuisa',
            nationality: 'Puerto Rican',
            municipality: 'Loíza',
            yucayeke: 'Jaymanío',
            isBorikuaTaino: true,
        },
        maternalGrandfather: {
            name: 'Agüeybaná',
            nationality: 'Puerto Rican',
            municipality: 'Ponce',
            yucayeke: null,
            isBorikuaTaino: false,
        },
    };

    function buildService() {
        const ancestry = { upsert: jest.fn().mockResolvedValue({}) };
        const tx = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue({
                    id: enrollmentId,
                    userId,
                    status: EnrollmentStatus.DRAFT,
                }),
            },
            ancestry,
        };
        const database = {
            $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
        };
        const enrollmentStepService = { markStepComplete: jest.fn() };
        const service = new Step2Service(
            database as never,
            enrollmentStepService as never,
        );
        return { service, tx, ancestry, enrollmentStepService };
    }

    it('upserts exactly the three maternal Ancestry rows', async () => {
        const { service, ancestry } = buildService();

        await service.upsert(userId, input as never);

        expect(ancestry.upsert).toHaveBeenCalledTimes(3);

        const relations = ancestry.upsert.mock.calls.map(
            (c) => c[0].where.enrollmentId_relation.relation,
        );
        expect(relations).toEqual([
            AncestryRelation.MOTHER,
            AncestryRelation.MATERNAL_GRANDMOTHER,
            AncestryRelation.MATERNAL_GRANDFATHER,
        ]);
    });

    it('maps the mother row fields (including dateOfBirth) into create/update', async () => {
        const { service, ancestry } = buildService();

        await service.upsert(userId, input as never);

        const motherCall = ancestry.upsert.mock.calls.find(
            (c) => c[0].where.enrollmentId_relation.relation === AncestryRelation.MOTHER,
        )![0];

        expect(motherCall.where.enrollmentId_relation.enrollmentId).toBe(enrollmentId);
        expect(motherCall.update).toEqual({
            name: 'Anacaona',
            dateOfBirth: new Date('1950-04-01'),
            nationality: 'Puerto Rican',
            municipality: 'Jayuya',
            yucayeke: 'Guainía',
            isBorikuaTaino: true,
        });
        expect(motherCall.create).toEqual({
            enrollmentId,
            relation: AncestryRelation.MOTHER,
            name: 'Anacaona',
            dateOfBirth: new Date('1950-04-01'),
            nationality: 'Puerto Rican',
            municipality: 'Jayuya',
            yucayeke: 'Guainía',
            isBorikuaTaino: true,
        });
    });

    it('marks step 2 complete', async () => {
        const { service, enrollmentStepService } = buildService();

        const result = await service.upsert(userId, input as never);

        expect(enrollmentStepService.markStepComplete).toHaveBeenCalledWith(
            expect.anything(),
            enrollmentId,
            2,
        );
        expect(result).toEqual({ success: true });
    });
});
