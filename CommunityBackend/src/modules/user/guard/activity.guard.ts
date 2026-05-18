import { UserService } from "@/modules/user/user.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class ActivityGuard implements CanActivate {
    constructor(private userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req  = context.switchToHttp().getRequest();
        const user = req.user;

        if (user) {
            const now = new Date();

            // throttle (5 min)
            if (
                !user.lastActiveAt ||
                now.getTime() - new Date(user.lastActiveAt).getTime() > 1 * 60 * 1000
            ) {
                await this.userService.updateLastActive(user.id);
            }
        }

        return true;
    }
}