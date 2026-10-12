// index.ts · Worker entry: the deck is static assets, /api/* runs here, a cron retries emails ⚡
import type { Ctx, Env } from './types.ts';
import { handle } from './api.ts';
import { retryNotifications } from './relay.ts';

export default {
  fetch: (req: Request, env: Env, ctx: Ctx): Promise<Response> =>
    new URL(req.url).pathname.startsWith('/api/') ? handle(req, env, ctx) : env.ASSETS!.fetch(req),
  scheduled: (_event: unknown, env: Env, ctx: Ctx): void => ctx.waitUntil(retryNotifications(env, fetch)),
};
