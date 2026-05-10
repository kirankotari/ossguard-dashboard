import { useEffect, useState, useMemo } from 'react';
import {
  Search, LayoutGrid, List, RefreshCw,
  Globe, GitFork, Lock, X, Settings, Layers,
} from 'lucide-react';
import { useDashboardStore, type RepoTab } from '../store/dashboard';
import { useAuthStore } from '../store/auth';
import { fetchUserRepos, fetchOrgRepos, initOctokit } from '../lib/github';
import RepoCard from './RepoCard';
import RepoDetail from './RepoDetail';
import SettingsPanel from './SettingsPanel';
import { cn } from '../lib/cn';

const TABS: { id: RepoTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'public', label: 'Public', icon: <Globe className="w-3.5 h-3.5" />, desc: 'Scorecard available' },
  { id: 'forked', label: 'Forked', icon: <GitFork className="w-3.5 h-3.5" />, desc: 'Upstream forks' },
  { id: 'private', label: 'Private', icon: <Lock className="w-3.5 h-3.5" />, desc: 'No scorecard' },
  { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" />, desc: 'All repositories' },
];

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const {
    selectedOrg, repoTab, repos, scores, favorites, excludedRepos,
    loading, error, showSettings,
    setRepos, setLoading, setError, setRepoTab, setShowSettings,
  } = useDashboardStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'activity'>('score');
  const [langFilter, setLangFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    initOctokit(token);
    loadRepos();
  }, [token, selectedOrg]);

  async function loadRepos() {
    if (selectedOrg === '__favorites__') return;
    setLoading(true);
    setError(null);
    try {
      const data =
        selectedOrg === null
          ? await fetchUserRepos()
          : await fetchOrgRepos(selectedOrg);
      setRepos(data.filter((r) => !r.archived));
    } catch (e: any) {
      setError(e.message || 'Failed to load repos');
    } finally {
      setLoading(false);
    }
  }

  // Available languages for filter
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => { if (r.language) langs.add(r.language); });
    return [...langs].sort();
  }, [repos]);

  // Tab-filtered repos
  const tabRepos = useMemo(() => {
    if (selectedOrg === '__favorites__') {
      return repos.filter((r) => favorites.includes(r.full_name));
    }
    return repos.filter((r) => {
      if (repoTab === 'public') return r.visibility === 'public' && !r.fork;
      if (repoTab === 'forked') return r.fork;
      if (repoTab === 'private') return r.visibility === 'private';
      return true;
    });
  }, [repos, repoTab, selectedOrg, favorites]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: repos.length,
    public: repos.filter((r) => r.visibility === 'public' && !r.fork).length,
    forked: repos.filter((r) => r.fork).length,
    private: repos.filter((r) => r.visibility === 'private').length,
  }), [repos]);

  const displayRepos = useMemo(() => {
    let filtered = tabRepos.filter((r) => !excludedRepos.includes(r.full_name));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.language?.toLowerCase().includes(q)
      );
    }

    if (langFilter) {
      filtered = filtered.filter((r) => r.language === langFilter);
    }

    return [...filtered].sort((a, b) => {
      // Scored repos always on top
      const hasA = scores[a.full_name] !== undefined;
      const hasB = scores[b.full_name] !== undefined;
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      if (sortBy === 'score') {
        const sa = scores[a.full_name]?.score ?? -1;
        const sb = scores[b.full_name]?.score ?? -1;
        return sa - sb; // worst first
      }
      if (sortBy === 'activity') {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [tabRepos, search, sortBy, scores, langFilter, excludedRepos]);

  // Summary stats
  const stats = useMemo(() => {
    const scored = displayRepos.filter((r) => scores[r.full_name]);
    const total = scored.length;
    const avgScore = total > 0 ? scored.reduce((sum, r) => sum + (scores[r.full_name]?.score ?? 0), 0) / total : 0;
    const critical = scored.filter((r) => (scores[r.full_name]?.score ?? 10) < 4).length;
    const good = scored.filter((r) => (scores[r.full_name]?.score ?? 0) >= 7).length;
    const warning = scored.filter((r) => {
      const s = scores[r.full_name]?.score ?? 10;
      return s >= 4 && s < 7;
    }).length;
    return { total, avgScore, critical, good, warning, scored: scored.length, unscored: displayRepos.length - scored.length };
  }, [displayRepos, scores]);

  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />;
  }

  if (selectedRepo) {
    return <RepoDetail repoFullName={selectedRepo} onBack={() => setSelectedRepo(null)} />;
  }

  const isFavView = selectedOrg === '__favorites__';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">
            {isFavView ? 'Favorites' : selectedOrg ? selectedOrg : 'My Repositories'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {displayRepos.length} repos{stats.scored > 0 && ` · ${stats.scored} scored`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={loadRepos}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        <KpiCard label="Total" value={displayRepos.length} color="text-slate-200" />
        <KpiCard
          label="Avg Score"
          value={stats.total > 0 ? stats.avgScore.toFixed(1) : '—'}
          color={stats.avgScore >= 7 ? 'text-emerald-400' : stats.avgScore >= 4 ? 'text-yellow-400' : 'text-red-400'}
        />
        <KpiCard label="Good (7+)" value={stats.good} color="text-emerald-400" />
        <KpiCard label="Warning (4-6)" value={stats.warning} color="text-yellow-400" />
        <KpiCard label="Critical (<4)" value={stats.critical} color="text-red-400" />
      </div>

      {/* Tabs (not shown for favorites view) */}
      {!isFavView && (
        <div className="flex items-center gap-1 mb-4 bg-slate-900/50 rounded-xl p-1 border border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRepoTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                repoTab === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {tab.icon}
              {tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                repoTab === tab.id ? 'bg-slate-700 text-slate-300' : 'bg-slate-800/50 text-slate-600'
              )}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language filter */}
          <select
            value={langFilter ?? ''}
            onChange={(e) => setLangFilter(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Sort: Lowest Score</option>
            <option value="activity">Sort: Recent Activity</option>
            <option value="name">Sort: Name</option>
          </select>

          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 transition-colors',
                view === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 transition-colors',
                view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters strip */}
      {(langFilter || search) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {langFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
              {langFilter}
              <button onClick={() => setLangFilter(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-700 text-slate-300 text-xs">
              "{search}"
              <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={() => { setLangFilter(null); setSearch(''); }}
            className="text-[10px] text-slate-600 hover:text-slate-400"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && displayRepos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500">
            {isFavView
              ? 'No favorite repos yet. Star some repos to track them here.'
              : `No ${repoTab} repositories found.`}
          </p>
        </div>
      )}

      {/* Repos */}
      {!loading && displayRepos.length > 0 && (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'space-y-2'
          )}
        >
          {displayRepos.map((repo) => (
            <div key={repo.id} onClick={() => setSelectedRepo(repo.full_name)} className="cursor-pointer">
              <RepoCard repo={repo} />
            </div>
          ))}
        </div>
      )}

      {/* Status footer */}
      <div className="mt-6 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> Good (7+)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500" /> Warning (4-6)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500" /> Critical (&lt;4)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-600" /> No data</span>
        </div>
        <span>{stats.unscored > 0 && `${stats.unscored} repos pending score`}</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums', color)}>{value}</p>
    </div>
  );
}
