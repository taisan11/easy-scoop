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