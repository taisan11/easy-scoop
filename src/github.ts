import { GitHubReleaseInfo, UpdateCheckResult } from "./types";

const GITHUB_API = "https://api.github.com";

function authHeaders(): HeadersInit {
    const token = process.env.GITHUB_TOKEN || Bun?.env?.GITHUB_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
            ...authHeaders()
        }
    });
    if (!res.ok) {
        throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
}

export async function getReleases(owner: string, repo: string): Promise<GitHubReleaseInfo[]> {
    return fetchJson<GitHubReleaseInfo[]>(`${GITHUB_API}/repos/${owner}/${repo}/releases`);
}

export async function getLatestRelease(owner: string, repo: string): Promise<GitHubReleaseInfo> {
    return fetchJson<GitHubReleaseInfo>(`${GITHUB_API}/repos/${owner}/${repo}/releases/latest`);
}

function normalizeVersion(v: string): string {
    return v.startsWith("v") ? v.slice(1) : v;
}

function parseSemver(v: string): number[] {
    return normalizeVersion(v).split(".").map(p => parseInt(p.replace(/[^0-9].*$/, ""), 10) || 0);
}

export function compareVersions(a: string, b: string): number {
    const pa = parseSemver(a);
    const pb = parseSemver(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

export async function checkUpdate(owner: string, repo: string, current: string): Promise<UpdateCheckResult> {
    const latest = await getLatestRelease(owner, repo);
    const latestTag = latest.tag_name || latest.name;
    const hasUpdate = compareVersions(latestTag, current) > 0;
    return {
        current,
        latest: latestTag,
        hasUpdate
    };
}
