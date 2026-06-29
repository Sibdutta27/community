import { DatabaseService } from "@/database/database.service";
import { EnrollmentStatus } from "@/generated/prisma/enums";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class EnrollmentEditable implements CanActivate {
    constructor(private readonly database: DatabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        // get user id from request (assuming it's set by a previous auth guard)
        const request = context.switchToHttp().getRequest();
        const userId  = request.user.id;

        // if no user id, then not authenticated
        if (!userId) {
            throw new ForbiddenException('User not authenticated');
        }

        // check if enrollment is already attached to request
        let enrollment = request.enrollment;

        if ( !enrollment ) {
            // check enrollment and consent status
            enrollment = await this.database.enrollment.findFirst({
                where: { userId },
            });
        }

        // if no enrollment, then user is not enrolled
        if (!enrollment) {
            throw new ForbiddenException('Enrollment not found');
        }

        // if consent not accepted, then forbid access
        if ( enrollment.status !== EnrollmentStatus.DRAFT ) {
            throw new ForbiddenException('Enrollment is not editable.');
        }

        // attach for reuse
        request.enrollment = enrollment;

        return true;
    }
}