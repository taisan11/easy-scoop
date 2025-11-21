import { Hono } from "hono";
import { scoop_app_manifest, builder_type, StoredManifest, ApiErrorResponse, ApiSuccessResponse } from "./types";
import * as v from "valibot";
import { saveManifest, getManifest, listManifests } from "./storage";
import { getReleases, getLatestRelease, checkUpdate } from "./github";

type Bindings = { DB: D1Database };

const api = new Hono<{ Bindings: Bindings }>();

api.get("/",(c)=>{return c.json({message:"API root"})});

api.post("/validate",async(c)=>{
    const data = await c.req.json();
    const result = v.safeParse(data,scoop_app_manifest);
    return c.json(result);
});

// アプリマニフェスト作成 (保存はWIP: 現在はメモリのみ)
api.post("/create-app", async (c) => {
    try {
        const data = await c.req.json();
        const manifestResult = v.safeParse(data?.scoop_app_manifest, scoop_app_manifest);
        if (!manifestResult.success) {
            return c.json({ error: "Validation error (manifest)", detail: manifestResult.issues } satisfies ApiErrorResponse, 400);
        }
        const now = new Date().toISOString();
        const stored: StoredManifest = {
            name: manifestResult.output.name,
            manifest: manifestResult.output,
            created_at: now,
            updated_at: now
        };
        await saveManifest(stored, { DB: c.env.DB });
        return c.json({ success: true, data: stored } satisfies ApiSuccessResponse<StoredManifest>, 201);
    } catch (e) {
        return c.json({ error: "Unhandled error", detail: String(e) } satisfies ApiErrorResponse, 500);
    }
});

// 一覧
api.get("/apps", async (c) => {
    const items = await listManifests({ DB: c.env.DB });
    return c.json({ success: true, data: items });
});

// 個別取得
api.get("/apps/:name", async (c) => {
    const name = c.req.param("name");
    const found = await getManifest(name, { DB: c.env.DB });
    if (!found) {
        return c.json({ error: "Not found" } satisfies ApiErrorResponse, 404);
    }
    return c.json({ success: true, data: found } satisfies ApiSuccessResponse<StoredManifest>);
});

// GitHub 全リリース
api.get("/github/:owner/:repo/releases", async (c) => {
    const { owner, repo } = c.req.param();
    try {
        const releases = await getReleases(owner, repo);
        return c.json({ success: true, data: releases });
    } catch (e) {
        return c.json({ error: "GitHub fetch error", detail: String(e) } satisfies ApiErrorResponse, 502);
    }
});

// GitHub 最新リリース
api.get("/github/:owner/:repo/releases/latest", async (c) => {
    const { owner, repo } = c.req.param();
    try {
        const latest = await getLatestRelease(owner, repo);
        return c.json({ success: true, data: latest });
    } catch (e) {
        return c.json({ error: "GitHub fetch error", detail: String(e) } satisfies ApiErrorResponse, 502);
    }
});

// バージョン更新確認
api.get("/github/:owner/:repo/check-update/:current", async (c) => {
    const { owner, repo, current } = c.req.param();
    try {
        const result = await checkUpdate(owner, repo, current);
        return c.json({ success: true, data: result });
    } catch (e) {
        return c.json({ error: "GitHub fetch error", detail: String(e) } satisfies ApiErrorResponse, 502);
    }
});

export default api;