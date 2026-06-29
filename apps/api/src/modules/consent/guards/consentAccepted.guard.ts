import { DatabaseService } from "@/database/database.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class ConsentAcceptedGuard implements CanActivate {
    constructor(private readonly database: DatabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        // get user id from request (assuming it's set by a previous auth guard)
        const request = context.switchToHttp().getRequest();
        const userId = request.user.id;

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
        if (!enrollment.consentAccepted) {
            throw new ForbiddenException('Consent not accepted');
        }

        // attach for reuse
        request.enrollment = enrollment;

        return true;
    }
}