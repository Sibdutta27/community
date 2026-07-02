import { EnrollmentStatus, AncestryRelation } from '@/generated/prisma/enums';
import { Step3Service } from './step3.service';

describe('Step3Service.upsert (paternal kinship → Ancestry rows)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    const input = {
        father: {
            name: 'Guarionex',
            dateOfBirth: '1948-06-12',
            nationality: 'Puerto Rican',
            municipality: 'Utuado',
            yucayeke: 'Otoao',
            isBorikuaTaino: true,
        },
        paternalGrandmother: {
            name: 'Guanina',
            nationality: 'Puerto Rican',
            municipality: 'Añasco',
            yucayeke: null,
            isBorikuaTaino: true,
        },
        paternalGrandfather: {
            name: 'Mabodamaca',
            nationality: 'Puerto Rican',
            municipality: 'Isabela',
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
        const service = new Step3Service(
            database as never,
            enrollmentStepService as never,
        );
        return { service, tx, ancestry, enrollmentStepService };
    }

    it('upserts exactly the three paternal Ancestry rows', async () => {
        const { service, ancestry } = buildService();

        await service.upsert(userId, input as never);

        expect(ancestry.upsert).toHaveBeenCalledTimes(3);

        const relations = ancestry.upsert.mock.calls.map(
            (c) => c[0].where.enrollmentId_relation.relation,
        );
        expect(relations).toEqual([
            AncestryRelation.FATHER,
            AncestryRelation.PATERNAL_GRANDMOTHER,
            AncestryRelation.PATERNAL_GRANDFATHER,
        ]);
    });

    it('maps the father row fields (including dateOfBirth) into create', async () => {
        const { service, ancestry } = buildService();

        await service.upsert(userId, input as never);

        const fatherCall = ancestry.upsert.mock.calls.find(
            (c) => c[0].where.enrollmentId_relation.relation === AncestryRelation.FATHER,
        )![0];

        expect(fatherCall.create).toEqual({
            enrollmentId,
            relation: AncestryRelation.FATHER,
            name: 'Guarionex',
            dateOfBirth: new Date('1948-06-12'),
            nationality: 'Puerto Rican',
            municipality: 'Utuado',
            yucayeke: 'Otoao',
            isBorikuaTaino: true,
        });
    });

    it('marks step 3 complete', async () => {
        const { service, enrollmentStepService } = buildService();

        const result = await service.upsert(userId, input as never);

        expect(enrollmentStepService.markStepComplete).toHaveBeenCalledWith(
            expect.anything(),
            enrollmentId,
            3,
        );
        expect(result).toEqual({ success: true });
    });
});
