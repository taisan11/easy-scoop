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