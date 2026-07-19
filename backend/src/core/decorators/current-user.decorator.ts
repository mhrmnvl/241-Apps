import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    const user = request.user as Record<string, unknown> | undefined;

    return data ? user?.[data] : user;
  },
);
