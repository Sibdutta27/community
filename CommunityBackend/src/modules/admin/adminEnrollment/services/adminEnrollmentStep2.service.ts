import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class AdminEnrollmentStep2Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get formated meternal lineages
     */
    public async getStep2(enrollmentId: string) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { id: enrollmentId },
            include: { steps: true }
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if (enrollment.steps.length === 0) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if (!enrollment.steps.find(step => step.stepNumber == 2)?.isCompleted) {
            throw new BadRequestException('Step 2 not completed yet');
        }

        // Fetch maternal lineages
        const maternalLineages = await this.database.maternalLineage.findMany({
            where: { enrollmentId: enrollment.id },
        });

        return maternalLineages.map(item => ({
            id                  : item.id,
            relation            : item.relation,
            fullName            : item.fullName,
            maidenName          : item.maidenName,
            dateOfBirth         : item.dateOfBirth,
            placeOfBirth        : item.placeOfBirth,
            livingStatus        : item.livingStatus,
            approximateBirthYear: item.approximateBirthYear,
            regionOfOrigin      : item.regionOfOrigin,
            familyOccupation    : item.familyOccupation,
            additionalNotes     : item.additionalNotes,
        }))
    }

}
