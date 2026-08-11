import { AuthGuard } from '@nestjs/passport';

/**
 * Bearer auth that never blocks the request.
 *
 * A valid token attaches the user (readable with `@CurrentUser()`); a missing,
 * expired or malformed token simply leaves `request.user` null instead of
 * throwing. Use it on endpoints that must serve signed-out visitors while
 * still crediting the submission to a member when one is signed in.
 *
 * Note: passport reports "no credentials" as `user === false`, so the falsy
 * check below is deliberate — `??` would let `false` through.
 */
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = unknown>(_error: unknown, user: TUser): TUser {
        return (user || null) as TUser;
    }
}
