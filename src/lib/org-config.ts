import { getOctokit } from './github';

export interface OrgDashboardConfig {
  repos?: string[];
  exclude?: string[];
  teams?: Record<string, string[]>;
}

export async function fetchOrgConfig(org: string): Promise<OrgDashboardConfig | null> {
  try {
    const ok = getOctokit();
    const { data } = await ok.repos.getContent({
      owner: org,
      repo: '.github',
      path: '.ossguard.yml',
    });
    if ('content' in data && data.content) {
      const text = atob(data.content.replace(/\n/g, ''));
      return parseYamlLike(text);
    }
    return null;
  } catch {
    return null;
  }
}

function parseYamlLike(text: string): OrgDashboardConfig {
  const config: OrgDashboardConfig = {};
  let currentKey: string | null = null;
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.endsWith(':') && !trimmed.startsWith('-')) {
      currentKey = trimmed.slice(0, -1).trim();
      if (currentKey === 'repos') config.repos = [];
      if (currentKey === 'exclude') config.exclude = [];
    } else if (trimmed.startsWith('- ') && currentKey) {
      const val = trimmed.slice(2).trim();
      if (currentKey === 'repos') config.repos?.push(val);
      if (currentKey === 'exclude') config.exclude?.push(val);
    }
  }
  return config;
}
