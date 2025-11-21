import * as v from "valibot"

const architecture = v.object({
    "64bit": v.string(),
    "32bit": v.string(),
    "arm64": v.string(),
})

export const scoop_app_manifest = v.object({
    name: v.string(),
    version: v.string(),
    description: v.string(),
    homepage: v.string(),
    license: v.string(),
    notes: v.string(),
    architecture: architecture,
    post_install: v.array(v.string()),
    bin: v.array(v.string()),
    shortcuts: v.array(v.array(v.string())),
    persist: v.array(v.string()),
    checkver: v.object({
        url: v.string(),
        regex: v.string(),
    })
})

export const builder_type = v.object({
    build_ENV:v.union([v.literal("deno"), v.literal("bun"), v.literal("node"), v.literal("python")]),
    build:v.string(),
    env: v.record(v.string(), v.string())
})

export interface apps {
    [key: string]: {
        id: string,
        name: string,
        version: string,
        description: string,
        homepage: string,
        license: string,
    }
}

export interface builders {
    [key: string]: {
        id: string,
        name: string,
        build_ENV: string,
        build: string,
        env: { [key: string]: string }
    }
}

export type AppValue = apps[keyof apps];

export type BuilderValue = builders[keyof builders];

// GitHub Release API 型 (必要最小限 + assets)
export interface GitHubReleaseAsset {
    name: string;
    browser_download_url: string;
    size: number;
    content_type?: string;
}

export interface GitHubReleaseInfo {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    published_at: string;
    assets: GitHubReleaseAsset[];
}

// 永続化予定のアプリマニフェストラッパ (WIP: 保存形式は後で確定)
export interface StoredManifest {
    name: string;
    manifest: v.InferOutput<typeof scoop_app_manifest>;
    created_at: string; // ISO8601
    updated_at: string; // ISO8601
}

export interface ManifestIndexItem {
    name: string;
    version: string;
    updated_at: string;
}

// API レスポンス汎用
export interface ApiErrorResponse {
    error: string;
    detail?: unknown;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

// バージョン比較結果
export interface UpdateCheckResult {
    current: string;
    latest: string;
    hasUpdate: boolean;
}
