import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current authenticated user enrollment from the request.
 * Usage: @CurrentEnrollment() to get the entire user object, or @CurrentEnrollment('id') to get a specific property.
 */
export const CurrentEnrollment = createParamDecorator(
    (data: keyof any, ctx: ExecutionContext) => {
        const request    = ctx.switchToHttp().getRequest();
        const enrollment = request.enrollment;

        return data ? enrollment ?.[data] : enrollment;
    },
);