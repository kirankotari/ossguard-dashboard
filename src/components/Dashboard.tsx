import { useEffect, useState, useMemo } from 'react';
import { Search, LayoutGrid, List, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboard';
import { useAuthStore } from '../store/auth';
import { fetchUserRepos, fetchOrgRepos, initOctokit } from '../lib/github';
import RepoCard from './RepoCard';
import RepoDetail from './RepoDetail';
import { cn } from '../lib/cn';

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const { selectedOrg, repos, scores, favorites, loading, error, setRepos, setLoading, setError } =
    useDashboardStore();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'activity'>('score');

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

  const displayRepos = useMemo(() => {
    let filtered =
      selectedOrg === '__favorites__'
        ? repos.filter((r) => favorites.includes(r.full_name))
        : repos;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.language?.toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => {
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
  }, [repos, search, sortBy, scores, selectedOrg, favorites]);

  // Summary stats
  const stats = useMemo(() => {
    const scored = displayRepos.filter((r) => scores[r.full_name]);
    const total = scored.length;
    const avgScore = total > 0 ? scored.reduce((sum, r) => sum + (scores[r.full_name]?.score ?? 0), 0) / total : 0;
    const critical = scored.filter((r) => (scores[r.full_name]?.score ?? 10) < 4).length;
    const good = scored.filter((r) => (scores[r.full_name]?.score ?? 0) >= 7).length;
    return { total, avgScore, critical, good };
  }, [displayRepos, scores]);

  if (selectedRepo) {
    return <RepoDetail repoFullName={selectedRepo} onBack={() => setSelectedRepo(null)} />;
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Repositories" value={displayRepos.length} icon={<LayoutGrid className="w-4 h-4" />} />
        <StatCard
          label="Avg Score"
          value={stats.total > 0 ? stats.avgScore.toFixed(1) : '—'}
          icon={<Shield className="w-4 h-4" />}
          color={stats.avgScore >= 7 ? 'text-emerald-400' : stats.avgScore >= 4 ? 'text-yellow-400' : 'text-red-400'}
        />
        <StatCard label="Good (7+)" value={stats.good} icon={<Shield className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Critical (<4)" value={stats.critical} icon={<AlertTriangle className="w-4 h-4" />} color="text-red-400" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
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

      {/* Repos */}
      {!loading && displayRepos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500">
            {selectedOrg === '__favorites__'
              ? 'No favorite repos yet. Star some repos to track them here.'
              : 'No repositories found.'}
          </p>
        </div>
      )}

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
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'text-white',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  );
}
