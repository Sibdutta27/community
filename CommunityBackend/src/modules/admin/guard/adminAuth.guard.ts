import { UserService } from "@/modules/user/user.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor() { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (user && user.role === 'ADMIN') {
            return true;
        }

        return false;
    }
}