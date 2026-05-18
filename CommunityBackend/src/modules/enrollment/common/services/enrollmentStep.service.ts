import { DatabaseService } from '@/database/database.service';
import { Prisma } from '@/generated/prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnrollmentStepService {
    constructor(
        private readonly database: DatabaseService,
    ) { }

    // Update the enrollment step to mark it as complete
    public async markStepComplete( tx: Prisma.TransactionClient, enrollmentId: string, stepNumber: number ) {
        await tx.enrollmentStep.updateMany({
            where: {
                enrollmentId,
                stepNumber,
            },
            data: {
                isCompleted: true,
            },
        });
    }
}
