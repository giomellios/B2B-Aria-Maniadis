import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ForbiddenError, internal_getRequestContext, LogLevel, parseContext } from "@vendure/core";
import { Observable } from "rxjs";

import { PUBLIC_SHOP_OPERATIONS } from "../constants";

/**
 * Refuses Shop API operations from callers who are not signed in, except PUBLIC_SHOP_OPERATIONS.
 *
 * Global interceptors run after Vendure's AuthGuard, so the RequestContext (with its session) is
 * already resolved here. Only top-level fields are checked: nested fields (a collection's products,
 * an order's lines…) can only be reached through one of them.
 */
@Injectable()
export class MembersOnlyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { isGraphQL, req, info } = parseContext(context);
    if (!isGraphQL || info.path.prev !== undefined) {
      return next.handle();
    }
    const ctx = internal_getRequestContext(req, context);
    if (
      ctx.apiType !== "shop" ||
      ctx.activeUserId !== undefined ||
      PUBLIC_SHOP_OPERATIONS.has(info.fieldName)
    ) {
      return next.handle();
    }
    // Verbose: anonymous scrapers would otherwise fill the logs with warnings
    throw new ForbiddenError(LogLevel.Verbose);
  }
}
