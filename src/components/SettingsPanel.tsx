import { useState } from 'react';
import { ArrowLeft, EyeOff, Eye, Save, Cloud, Search, X } from 'lucide-react';
import { useDashboardStore } from '../store/dashboard';
import { useAuthStore } from '../store/auth';
import { saveConfig } from '../lib/gist-config';
import { cn } from '../lib/cn';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const token = useAuthStore((s) => s.token);
  const {
    repos, excludedRepos, includedRepos, favorites, selectedOrg, repoTab,
    toggleExcluded, addIncluded, removeIncluded,
  } = useDashboardStore();

  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addRepoInput, setAddRepoInput] = useState('');

  const filteredRepos = repos.filter((r) => {
    if (!search) return true;
    return r.full_name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSyncToGist = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await saveConfig({
        favorites,
        excludedRepos,
        includedRepos,
        selectedOrg,
        repoTab,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled in saveConfig
    } finally {
      setSaving(false);
    }
  };

  const handleAddRepo = () => {
    const val = addRepoInput.trim();
    if (val && val.includes('/')) {
      addIncluded(val);
      setAddRepoInput('');
    }
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure which repos to analyze. Changes are saved to localStorage and can be synced to a GitHub Gist.
          </p>
        </div>
        <button
          onClick={handleSyncToGist}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
          )}
        >
          {saving ? (
            <span className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
          ) : saved ? (
            <><Save className="w-4 h-4" /> Saved to Gist</>
          ) : (
            <><Cloud className="w-4 h-4" /> Sync to Gist</>
          )}
        </button>
      </div>

      {/* Manually included repos */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-3">Manually Added Repos</h3>
        <p className="text-xs text-slate-500 mb-3">
          Add external repos (from other orgs or users) to track in your dashboard.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={addRepoInput}
            onChange={(e) => setAddRepoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRepo()}
            placeholder="owner/repo (e.g. ossf/scorecard)"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddRepo}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Add
          </button>
        </div>
        {includedRepos.length > 0 ? (
          <div className="space-y-1">
            {includedRepos.map((r) => (
              <div key={r} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300">{r}</span>
                <button
                  onClick={() => removeIncluded(r)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600">No manually added repos.</p>
        )}
      </div>

      {/* Excluded repos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Repository Visibility</h3>
            <p className="text-xs text-slate-500">
              Toggle repos to exclude them from analysis. Excluded repos won't appear in the dashboard.
              {excludedRepos.length > 0 && (
                <span className="text-yellow-400 ml-1">({excludedRepos.length} excluded)</span>
              )}
            </p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter repos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredRepos.map((repo) => {
            const isExcluded = excludedRepos.includes(repo.full_name);
            return (
              <div
                key={repo.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer',
                  isExcluded
                    ? 'bg-slate-900/30 border-slate-800 opacity-60'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                )}
                onClick={() => toggleExcluded(repo.full_name)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    isExcluded ? 'bg-slate-800 text-slate-600' : 'bg-blue-500/10 text-blue-400'
                  )}>
                    {isExcluded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', isExcluded ? 'text-slate-500' : 'text-white')}>
                      {repo.name}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate">{repo.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full',
                    repo.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  )}>
                    {repo.visibility}
                  </span>
                  {repo.language && (
                    <span className="text-[10px] text-slate-600">{repo.language}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Org config hint */}
      <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h4 className="text-sm font-semibold text-white mb-1">Org-Level Configuration</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          For shared team settings, create a <code className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">.ossguard.yml</code> file
          in your org's <code className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">.github</code> repository:
        </p>
        <pre className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
{`# .github/.ossguard.yml
repos:
  - my-org/important-repo
  - my-org/another-repo
exclude:
  - my-org/deprecated-repo
  - my-org/test-repo`}
        </pre>
        <p className="text-[10px] text-slate-600 mt-2">
          All org members will see the same repo list when viewing this org in the dashboard.
        </p>
      </div>
    </div>
  );
}
