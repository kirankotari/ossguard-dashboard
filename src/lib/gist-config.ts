import { getOctokit } from './github';

const GIST_FILENAME = 'ossguard-dashboard.json';
const GIST_DESCRIPTION = 'OSSGuard Dashboard configuration (auto-managed)';

interface DashboardConfig {
  favorites: string[];
  excludedRepos: string[];
  includedRepos: string[];
  selectedOrg: string | null;
  repoTab: string;
}

let cachedGistId: string | null = null;

async function findConfigGist(): Promise<string | null> {
  if (cachedGistId) return cachedGistId;
  const ok = getOctokit();
  const { data } = await ok.gists.list({ per_page: 100 });
  const gist = data.find(
    (g) => g.description === GIST_DESCRIPTION && g.files?.[GIST_FILENAME]
  );
  if (gist) {
    cachedGistId = gist.id;
    return gist.id;
  }
  return null;
}

export async function loadConfig(): Promise<DashboardConfig | null> {
  try {
    const gistId = await findConfigGist();
    if (!gistId) return null;
    const ok = getOctokit();
    const { data } = await ok.gists.get({ gist_id: gistId });
    const content = data.files?.[GIST_FILENAME]?.content;
    if (!content) return null;
    return JSON.parse(content) as DashboardConfig;
  } catch {
    return null;
  }
}

export async function saveConfig(config: DashboardConfig): Promise<void> {
  try {
    const ok = getOctokit();
    const gistId = await findConfigGist();
    const files = {
      [GIST_FILENAME]: { content: JSON.stringify(config, null, 2) },
    };
    if (gistId) {
      await ok.gists.update({ gist_id: gistId, files });
    } else {
      const { data } = await ok.gists.create({
        description: GIST_DESCRIPTION,
        public: false,
        files,
      });
      cachedGistId = data.id ?? null;
    }
  } catch (e) {
    console.warn('Failed to save config to Gist:', e);
  }
}
