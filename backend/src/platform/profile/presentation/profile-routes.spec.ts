import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';

// UploadProfilePhotoUseCase imports 'file-type' (ESM-only), which Jest can't
// transform. A plain jest.mock() still evaluates the real module to build an
// automatic mock, so a factory is required to keep the real file from loading.
jest.mock('../use-cases/upload-profile-photo.use-case.js', () => ({
  UploadProfilePhotoUseCase: jest.fn(),
}));

import { ProfileController } from './profile.controller.js';
import { ProfileAddressController } from './profile-address.controller.js';
import { ProfileSocialMediaController } from './profile-social-media.controller.js';

/**
 * No profile route may be unreachable.
 *
 * Three controllers share the `profiles` prefix, and all three once declared
 * `me`. Nest registers them in the module's array order and Express answers
 * with the first match, so `GET /profiles/me` was mapped three times and only
 * the profile itself ever ran. Every self-service address and social-media
 * route was dead, and `PATCH /profiles/me/:id` matched the address controller's
 * `:addressId` first — editing your own social media link ran the address use
 * case against a social media id and answered "address not found".
 *
 * The controller specs beside this one all passed throughout, because they call
 * the methods directly. Nothing tested the routing, which is where the defect
 * lived — a route that no request reaches is invisible to a test that does not
 * make requests.
 *
 * This reads the decorators rather than booting the app: same metadata Nest
 * uses, no database, and it names the shadowed route instead of the symptom.
 */

/** The module's `controllers` array order, which is the registration order. */
const CONTROLLERS = [
  ProfileController,
  ProfileAddressController,
  ProfileSocialMediaController,
];

interface Route {
  controller: string;
  handler: string;
  method: string;
  path: string;
}

function methodName(method: RequestMethod): string {
  return RequestMethod[method] ?? String(method);
}

function routesOf(controller: (typeof CONTROLLERS)[number]): Route[] {
  const prefix = String(
    (Reflect.getMetadata(PATH_METADATA, controller) as string) ?? '',
  );
  const prototype = controller.prototype as object;

  // Declaration order, which is the order Nest registers handlers within a
  // controller — and therefore the order Express tries them.
  return Object.getOwnPropertyNames(prototype)
    .filter((name) => name !== 'constructor')
    .flatMap((name) => {
      const handler = (prototype as Record<string, unknown>)[name];
      if (typeof handler !== 'function') return [];
      const path = Reflect.getMetadata(PATH_METADATA, handler) as
        string | undefined;
      if (path === undefined) return [];
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as
        RequestMethod | undefined;
      return [
        {
          controller: controller.name,
          handler: name,
          method: methodName(method ?? RequestMethod.GET),
          path: `/${prefix}/${path}`.replace(/\/+/g, '/').replace(/\/$/, ''),
        },
      ];
    });
}

/** `/profiles/:userId/addresses` → matches `/profiles/anything/addresses`. */
function asMatcher(path: string): RegExp {
  const source = path
    .split('/')
    .map((segment) =>
      segment.startsWith(':')
        ? '[^/]+'
        : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp(`^${source}$`);
}

/** A concrete URL the route would be asked to serve. */
function asConcretePath(path: string): string {
  return path
    .split('/')
    .map((segment) => (segment.startsWith(':') ? 'a-value' : segment))
    .join('/');
}

describe('profile routes', () => {
  const routes = CONTROLLERS.flatMap(routesOf);

  it('finds the routes to check', () => {
    // A sweep over an empty list passes everything below it.
    expect(routes.length).toBeGreaterThan(15);
  });

  it('reaches every route it declares', () => {
    const shadowed: string[] = [];

    routes.forEach((route, index) => {
      const concrete = asConcretePath(route.path);
      const eclipsedBy = routes
        .slice(0, index)
        .find(
          (earlier) =>
            earlier.method === route.method &&
            asMatcher(earlier.path).test(concrete),
        );

      if (eclipsedBy) {
        shadowed.push(
          `${route.method} ${route.path} (${route.controller}.${route.handler}) ` +
            `never runs — ${eclipsedBy.controller}.${eclipsedBy.handler} answers it first`,
        );
      }
    });

    expect(shadowed).toEqual([]);
  });

  /**
   * The routes a person uses about themselves. Each resolves the caller through
   * `@CurrentUser` and cannot answer about anybody else, so it needs no
   * permission — and must not require one, because the only permission that
   * would fit is the one that reads every profile in the school.
   */
  it('serves the self-service paths the frontend asks for', () => {
    const declared = routes.map((route) => `${route.method} ${route.path}`);

    expect(declared).toEqual(
      expect.arrayContaining([
        'GET /profiles/me',
        'PATCH /profiles/me',
        'POST /profiles/me/photo',
        'DELETE /profiles/me/photo',
        'GET /profiles/me/addresses',
        'POST /profiles/me/addresses',
        'PATCH /profiles/me/addresses/:addressId',
        'DELETE /profiles/me/addresses/:addressId',
        'GET /profiles/me/social-media-links',
        'POST /profiles/me/social-media-links',
        'PATCH /profiles/me/social-media-links/:socialMediaId',
        'DELETE /profiles/me/social-media-links/:socialMediaId',
      ]),
    );
  });

  it("serves the paths for anyone else's profile", () => {
    const declared = routes.map((route) => `${route.method} ${route.path}`);

    expect(declared).toEqual(
      expect.arrayContaining([
        'GET /profiles/:userId',
        'PATCH /profiles/:userId',
        'GET /profiles/:userId/addresses',
        'POST /profiles/:userId/addresses',
        'GET /profiles/:userId/social-media-links',
        'POST /profiles/:userId/social-media-links',
        'GET /profiles/social-media-links/all',
      ]),
    );
  });
});
