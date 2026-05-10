import { Octokit } from '@octokit/rest';
import type { Org, Repo } from '../store/dashboard';

let octokit: Octokit | null = null;

export function initOctokit(token: string) {
  octokit = new Octokit({ auth: token });
}

export function getOctokit(): Octokit {
  if (!octokit) throw new Error('Octokit not initialized — call initOctokit first');
  return octokit;
}

export async function fetchUser(token: string) {
  const ok = new Octokit({ auth: token });
  const { data } = await ok.users.getAuthenticated();
  return data;
}

export async function fetchOrgs(): Promise<Org[]> {
  const ok = getOctokit();
  const { data } = await ok.orgs.listForAuthenticatedUser({ per_page: 100 });
  return data.map((o) => ({
    login: o.login,
    avatar_url: o.avatar_url,
    description: o.description ?? null,
  }));
}

export async function fetchUserRepos(): Promise<Repo[]> {
  const ok = getOctokit();
  const repos: Repo[] = [];
  let page = 1;
  while (true) {
    const { data } = await ok.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: 'pushed',
      affiliation: 'owner',
    });
    if (data.length === 0) break;
    repos.push(...data.map(mapRepo));
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

export async function fetchOrgRepos(org: string): Promise<Repo[]> {
  const ok = getOctokit();
  const repos: Repo[] = [];
  let page = 1;
  while (true) {
    const { data } = await ok.repos.listForOrg({
      org,
      per_page: 100,
      page,
      sort: 'pushed',
      type: 'all',
    });
    if (data.length === 0) break;
    repos.push(...data.map(mapRepo));
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

function mapRepo(r: any): Repo {
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    html_url: r.html_url,
    description: r.description ?? null,
    language: r.language ?? null,
    stargazers_count: r.stargazers_count,
    open_issues_count: r.open_issues_count,
    pushed_at: r.pushed_at,
    archived: r.archived ?? false,
    fork: r.fork ?? false,
    visibility: r.visibility ?? 'public',
    default_branch: r.default_branch ?? 'main',
  };
}
