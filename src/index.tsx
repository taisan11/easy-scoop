import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import api from './api'
import { listManifests, updateManifestVersion } from './storage'
import { checkUpdate } from './github'

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response;
  }
}

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>()

// API mount
app.route('/api', api)

app.get(
  "*",
  jsxRenderer(({ children, title }) => {
    return (
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title||"nun"}</title>
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);

export default app

// Daily cron: 0 0 * * * (configured in wrangler.jsonc)
export const scheduled = async (_event: any, env: Bindings, _ctx: any) => {
  const items = await listManifests({ DB: env.DB });
  for (const m of items) {
    const parts = m.name.split('/');
    if (parts.length !== 2) continue; // owner/repo形式のみ
    const [owner, repo] = parts;
    try {
      const result = await checkUpdate(owner, repo, m.version);
      if (result.hasUpdate) {
        await updateManifestVersion(m.name, result.latest, { DB: env.DB });
        console.log(`Updated ${m.name} -> ${result.latest}`);
      }
    } catch (e) {
      console.warn('Update check failed for', m.name, e);
    }
  }
};
