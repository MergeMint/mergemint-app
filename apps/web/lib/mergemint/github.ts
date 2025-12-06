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

export type GithubConnectionInfo = {
  installation_type?: 'app' | 'token';
  github_installation_id?: number | null;
  github_org_name?: string | null;
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

  /**
   * For GitHub App installation tokens.
   */
  async listInstallationRepos() {
    const res = await this.request<{ repositories: GithubRepository[] }>(
      `/installation/repositories`,
      { query: { per_page: 100 } },
    );
    return res.repositories;
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

function toBase64Url(input: string) {
  return Buffer.from(input).toString('base64url');
}

function getGithubAppJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyRaw = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKeyRaw) {
    throw new Error('Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY for GitHub App flow.');
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  };

  const header = { alg: 'RS256', typ: 'JWT' };
  const unsigned = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(privateKey, 'base64url');

  return `${unsigned}.${signature}`;
}

export async function getInstallationAccessToken(installationId: number | string) {
  const jwt = getGithubAppJwt();
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MergeMint-MVP',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to create installation token: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  return (await res.json()) as { token: string; expires_at: string };
}

/**
 * Resolve a GitHub API token for an org, preferring App installations and falling
 * back to environment-provided tokens for local development.
 */
export async function resolveGithubTokenForOrg(
  orgId: string,
  orgSlug?: string,
  connection?: GithubConnectionInfo | null,
) {
  if (
    connection?.installation_type === 'app' &&
    connection.github_installation_id !== null &&
    connection.github_installation_id !== undefined
  ) {
    const token = await getInstallationAccessToken(connection.github_installation_id);
    return { token: token.token, source: 'installation' as const };
  }

  const token = getGithubTokenForOrg(orgId, orgSlug ?? connection?.github_org_name ?? undefined);
  return { token, source: 'env' as const };
}

export async function getGithubClientForOrg(
  orgId: string,
  orgSlug?: string,
  connection?: GithubConnectionInfo | null,
) {
  const { token } = await resolveGithubTokenForOrg(orgId, orgSlug, connection);
  return new GithubClient(token);
}

export function hashTokenPreview(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
