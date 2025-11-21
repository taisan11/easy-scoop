import { StoredManifest, ManifestIndexItem } from "./types";
import { manifests } from "./schema";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

// WIP: 永続化は未実装。後でファイル/DB保存に差し替える予定。

// メモリ上の暫定ストレージ (D1未利用時フォールバック)
const memoryStore: Map<string, StoredManifest> = new Map();

export interface CloudflareBindings {
    DB: D1Database;
}

function getDb(env?: CloudflareBindings) {
    if (!env) return null;
    return drizzle(env.DB);
}

export async function saveManifest(manifest: StoredManifest, env?: CloudflareBindings): Promise<StoredManifest> {
    const db = getDb(env);
    if (db) {
        await db.insert(manifests).values({
            name: manifest.name,
            version: manifest.manifest.version,
            manifest_json: JSON.stringify(manifest.manifest),
            created_at: manifest.created_at,
            updated_at: manifest.updated_at,
        }).onConflictDoUpdate({
            target: manifests.name,
            set: {
                version: manifest.manifest.version,
                manifest_json: JSON.stringify(manifest.manifest),
                updated_at: manifest.updated_at,
            }
        });
        return manifest;
    }
    memoryStore.set(manifest.name, manifest);
    return manifest;
}

export async function getManifest(name: string, env?: CloudflareBindings): Promise<StoredManifest | undefined> {
    const db = getDb(env);
    if (db) {
        const rows = await db.select().from(manifests).where(eq(manifests.name, name));
        const row = rows[0];
        if (!row) return undefined;
        return {
            name: row.name,
            manifest: JSON.parse(row.manifest_json),
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    return memoryStore.get(name);
}

export async function listManifests(env?: CloudflareBindings): Promise<ManifestIndexItem[]> {
    const db = getDb(env);
    if (db) {
        const rows = await db.select({ name: manifests.name, version: manifests.version, updated_at: manifests.updated_at }).from(manifests);
        return rows.map(r => ({ name: r.name, version: r.version, updated_at: r.updated_at }));
    }
    return Array.from(memoryStore.values()).map(m => ({
        name: m.name,
        version: m.manifest.version,
        updated_at: m.updated_at
    }));
}

export async function updateManifest(name: string, manifest: StoredManifest, env?: CloudflareBindings): Promise<StoredManifest> {
    const db = getDb(env);
    if (db) {
        await db.update(manifests).set({
            version: manifest.manifest.version,
            manifest_json: JSON.stringify(manifest.manifest),
            updated_at: manifest.updated_at,
        }).where(eq(manifests.name, name));
        return manifest;
    }
    if (!memoryStore.has(name)) throw new Error("Manifest not found");
    memoryStore.set(name, manifest);
    return manifest;
}

export async function deleteManifest(name: string, env?: CloudflareBindings): Promise<boolean> {
    const db = getDb(env);
    if (db) {
        await db.delete(manifests).where(eq(manifests.name, name));
        return true;
    }
    return memoryStore.delete(name);
}

export async function updateManifestVersion(name: string, newVersion: string, env?: CloudflareBindings): Promise<StoredManifest | undefined> {
    const current = await getManifest(name, env);
    if (!current) return undefined;
    current.manifest.version = newVersion;
    current.updated_at = new Date().toISOString();
    await updateManifest(name, current, env);
    return current;
}
