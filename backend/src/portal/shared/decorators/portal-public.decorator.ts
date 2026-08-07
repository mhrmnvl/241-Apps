import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from '../../../core/decorators/public.decorator.js';
import { PortalCacheInterceptor } from '../interceptors/portal-cache.interceptor.js';

/**
 * Everything an anonymous portal endpoint needs, in one decorator.
 *
 * The throttling is the part worth explaining. `ThrottlerModule` is configured
 * with three named buckets and the guard evaluates *all* of them on every
 * route, so a portal endpoint left on the defaults would still be capped by
 * `default` — the bucket sized for authenticated API traffic. A class of
 * students browsing the gallery on the school wifi shares one NAT address and
 * would trip it within a minute.
 *
 * So the two SIAKAD-facing buckets are skipped and `portal-public` is the only
 * one that applies. That is also what keeps the isolation honest in the other
 * direction: however hard the public site is hit, it is spending its own
 * allowance and cannot degrade SIAKAD, inventory, or PPDB (FR-027, SC-012).
 *
 * Applied to every `/portal/public/*` route. A public endpoint that forgets it
 * is not broken, only mis-bucketed and uncached — which is exactly the kind of
 * quiet inconsistency a named decorator prevents.
 */
export function PortalPublic() {
  return applyDecorators(
    PortalPublicUncached(),
    UseInterceptors(PortalCacheInterceptor),
  );
}

/**
 * The same, without response caching.
 *
 * For the media redirect only. Its response is a `302` to a *freshly minted*
 * signed URL; caching it would hand later visitors a credential that has since
 * expired, so the address stays stable while the target must not be reused
 * (research R2).
 */
export function PortalPublicUncached() {
  return applyDecorators(
    Public(),
    SkipThrottle({ default: true, auth: true }),
    Throttle({ 'portal-public': {} }),
  );
}
