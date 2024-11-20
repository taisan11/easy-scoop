import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response;
  }
}

const app = new Hono()

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
