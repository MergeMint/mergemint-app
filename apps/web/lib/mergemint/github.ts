import crypto from 'node:crypto';

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
};

type GithubUser = {
  id: number;
  login: string;
  avatar_url?: string;
};

export type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  default_branch?: string;
  owner: GithubUser;
};

export type GithubIssue = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: { name: string }[];
  created_at: string;
  closed_at: string | null;
  user: GithubUser;
  html_url: string;
};

export type GithubPullRequest = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  head: { sha: string };
  base: { sha: string };
  html_url: string;
  additions: number;
  deletions: number;
  changed_files: number;
  user: GithubUser;
};

export type GithubPullRequestFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export class GithubClient {
  constructor(private readonly token: string) {}

  async request<T>(path: string, options: RequestOptions = {}) {
    const url = new URL(`https://api.github.com${path}`);
    Object.entries(options.query ?? {}).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MergeMint-MVP',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `GitHub API ${path} failed: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    return (await res.json()) as T;
  }

  listRepos(org: string) {
    return this.request<GithubRepository[]>(`/orgs/${org}/repos`, {
      query: { per_page: 100, sort: 'updated' },
    });
  }

  listIssues(owner: string, repo: string, since?: string) {
    return this.request<GithubIssue[]>(
      `/repos/${owner}/${repo}/issues`,
      since
        ? { query: { state: 'all', since, per_page: 50, sort: 'updated' } }
        : { query: { state: 'all', per_page: 50, sort: 'updated' } },
    );
  }

  listPulls(owner: string, repo: string, since?: string) {
    return this.request<GithubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls`,
      since
        ? {
            query: {
              state: 'closed',
              sort: 'updated',
              direction: 'desc',
              per_page: 50,
              since,
            },
          }
        : {
            query: {
              state: 'closed',
              sort: 'updated',
              direction: 'desc',
              per_page: 50,
            },
          },
    );
  }

  listPullFiles(owner: string, repo: string, number: number) {
    return this.request<GithubPullRequestFile[]>(
      `/repos/${owner}/${repo}/pulls/${number}/files`,
      { query: { per_page: 100 } },
    );
  }
}

/**
 * Resolve the GitHub token for an organization. Raw tokens are never stored
 * in the database; instead we rely on environment variables or secret stores.
 */
export function getGithubTokenForOrg(orgId: string, slug?: string) {
  const envKeyByOrg = process.env[`GITHUB_TOKEN_${orgId}`];
  const envKeyBySlug = slug
    ? process.env[`GITHUB_TOKEN_${slug.toUpperCase()}`]
    : undefined;
  const globalToken = process.env.GITHUB_TOKEN;

  const token = envKeyByOrg ?? envKeyBySlug ?? globalToken;

  if (!token) {
    throw new Error(
      `Missing GitHub token. Set GITHUB_TOKEN_${orgId} or GITHUB_TOKEN in environment.`,
    );
  }

  return token;
}

export function hashTokenPreview(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
