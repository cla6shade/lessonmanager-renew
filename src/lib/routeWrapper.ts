import { getSession, SessionData } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { buildErrorResponse } from '@/app/utils';

/**
 * Route context with dynamic params
 */
type RouteContext<TParams = unknown> = {
  params: Promise<TParams>;
};
/**
 * Base route handler without session
 */
type RouteHandler<TParams = unknown> = (
  request: NextRequest,
  context: RouteContext<TParams>,
) => Promise<NextResponse>;

/**
 * Route handler with session data
 */
type SessionRouteHandler<TParams = unknown> = (
  request: NextRequest,
  session: SessionData,
  context: RouteContext<TParams>,
) => Promise<NextResponse>;

/**
 * Options for route wrapper
 */
interface RouteWrapperOptions {
  /**
   * Requires session.isAdmin === true
   * Session will be injected as second parameter
   */
  requireAdmin?: boolean;

  /**
   * Requires session.isLoggedIn === true
   * Session will be injected as second parameter
   */
  requireSession?: boolean;
}

export function routeWrapper<TParams = unknown>(
  handler: RouteHandler<TParams>,
): RouteHandler<TParams>;

export function routeWrapper<TParams = unknown>(
  handler: SessionRouteHandler<TParams>,
  options: RouteWrapperOptions,
): RouteHandler<TParams>;

/**
 * Error boundary wrapper that catches all errors and enforces authentication
 *
 * @example Public route (no auth required)
 * export const GET = routeWrapper(async (request, context) => {
 *   return NextResponse.json({ data: [] });
 * });
 *
 * @example Admin only
 * export const GET = routeWrapper(async (request, session, context) => {
 *   // session.isAdmin is guaranteed to be true
 *   console.log('Admin:', session.name);
 *   return NextResponse.json({ data: [] });
 * }, { requireAdmin: true });
 *
 * @example Any authenticated user
 * export const POST = routeWrapper(async (request, session, context) => {
 *   // session.isLoggedIn is guaranteed to be true
 *   if (session.userId) console.log('Student');
 *   if (session.teacherId) console.log('Teacher');
 *   return NextResponse.json({ data: [] });
 * }, { requireSession: true });
 *
 * @example With typed route params
 * export const PUT = routeWrapper<{ id: string }>(async (request, session, context) => {
 *   const { id } = await context.params;
 *   return NextResponse.json({ id });
 * }, { requireAdmin: true });
 */
export function routeWrapper<TParams = unknown>(
  handler: RouteHandler<TParams> | SessionRouteHandler<TParams>,
  options?: RouteWrapperOptions,
): RouteHandler<TParams> {
  const requiresAuth = options?.requireAdmin || options?.requireSession;

  return async (request: NextRequest, context: RouteContext<TParams>) => {
    try {
      // Public route - no auth required
      if (!requiresAuth) {
        return await (handler as RouteHandler<TParams>)(request, context);
      }

      // Get and validate session
      const session = await getSession();

      if (options.requireAdmin && !session.isAdmin) {
        return createUnauthorizedResponse();
      }

      if (options.requireSession && !session.isLoggedIn) {
        return createUnauthorizedResponse();
      }

      // Authenticated route - inject session
      return await (handler as SessionRouteHandler<TParams>)(request, session, context);
    } catch (error) {
      return buildErrorResponse(error);
    }
  };
}

function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
}
