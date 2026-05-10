import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Org {
  login: string;
  avatar_url: string;
  description: string | null;
}

export type RepoTab = 'public' | 'forked' | 'private';

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  visibility: string;
  default_branch: string;
}

export interface ScorecardCheck {
  name: string;
  score: number;
  reason: string;
  details: string[] | null;
}

export interface ScorecardResult {
  repo: string;
  score: number;
  date: string;
  checks: ScorecardCheck[];
}

interface DashboardState {
  selectedOrg: string | null;
  repoTab: RepoTab;
  orgs: Org[];
  repos: Repo[];
  scores: Record<string, ScorecardResult>;
  favorites: string[];
  excludedRepos: string[];
  includedRepos: string[];
  loading: boolean;
  loadingScores: Record<string, boolean>;
  error: string | null;
  showSettings: boolean;

  setSelectedOrg: (org: string | null) => void;
  setRepoTab: (tab: RepoTab) => void;
  setOrgs: (orgs: Org[]) => void;
  setRepos: (repos: Repo[]) => void;
  setScore: (repoFullName: string, result: ScorecardResult) => void;
  setLoading: (loading: boolean) => void;
  setLoadingScore: (repo: string, loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFavorite: (repoFullName: string) => void;
  toggleExcluded: (repoFullName: string) => void;
  addIncluded: (repoFullName: string) => void;
  removeIncluded: (repoFullName: string) => void;
  setShowSettings: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      selectedOrg: null,
      repoTab: 'public',
      orgs: [],
      repos: [],
      scores: {},
      favorites: [],
      excludedRepos: [],
      includedRepos: [],
      loading: false,
      loadingScores: {},
      error: null,
      showSettings: false,

      setSelectedOrg: (org) => set({ selectedOrg: org }),
      setRepoTab: (tab) => set({ repoTab: tab }),
      setOrgs: (orgs) => set({ orgs }),
      setRepos: (repos) => set({ repos }),
      setScore: (repoFullName, result) =>
        set({ scores: { ...get().scores, [repoFullName]: result } }),
      setLoading: (loading) => set({ loading }),
      setLoadingScore: (repo, loading) =>
        set({ loadingScores: { ...get().loadingScores, [repo]: loading } }),
      setError: (error) => set({ error }),
      toggleFavorite: (repoFullName) => {
        const favs = get().favorites;
        set({
          favorites: favs.includes(repoFullName)
            ? favs.filter((f) => f !== repoFullName)
            : [...favs, repoFullName],
        });
      },
      toggleExcluded: (repoFullName) => {
        const ex = get().excludedRepos;
        set({
          excludedRepos: ex.includes(repoFullName)
            ? ex.filter((r) => r !== repoFullName)
            : [...ex, repoFullName],
        });
      },
      addIncluded: (repoFullName) => {
        const inc = get().includedRepos;
        if (!inc.includes(repoFullName)) set({ includedRepos: [...inc, repoFullName] });
      },
      removeIncluded: (repoFullName) => {
        set({ includedRepos: get().includedRepos.filter((r) => r !== repoFullName) });
      },
      setShowSettings: (show) => set({ showSettings: show }),
    }),
    {
      name: 'ossguard-dashboard',
      partialize: (state) => ({
        favorites: state.favorites,
        selectedOrg: state.selectedOrg,
        repoTab: state.repoTab,
        excludedRepos: state.excludedRepos,
        includedRepos: state.includedRepos,
      }) as unknown as DashboardState,
    }
  )
);
