import {$} from "bun"

await $`bun drizzle-kit generate`
await $`bun wrangler d1 migrations apply easy-scoop --local`

if (Bun.argv.includes("--prod")) {
  await $`bun wrangler d1 migrations apply easy-scoop --remote`
}