import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class AdminEnrollmentStep3Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all selected cultural connections
     */
    public async getStep3(
        enrollmentId: string
    ){

        const enrollment = await this.database.enrollment.findFirst({
            where: { id: enrollmentId },
            select: {
                id                 : true,
                steps              : true,
                culturalConnections: {
                    select: {
                        CulturalConnection: true,
                    }
                },
            },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if (enrollment.steps.length === 0) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if (!enrollment.steps.find(step => step.stepNumber == 3)?.isCompleted) {
            throw new BadRequestException('Step 3 not completed yet');
        }

        return enrollment.culturalConnections.map( item => {
            return {
                id         : item.CulturalConnection.id,
                key        : item.CulturalConnection.key,
                active     : item.CulturalConnection.active,
                describtion: item.CulturalConnection.description,
            }
        });
        
    }

}
