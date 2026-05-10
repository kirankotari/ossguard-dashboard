import { useState } from 'react';
import {
  Shield, ArrowRight, AlertCircle, Eye, Building2, Star,
  BarChart3, Lock, Activity, Layers, Filter, Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { fetchUser, initOctokit } from '../lib/github';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const features = [
  {
    icon: Eye,
    title: 'Bird\'s Eye View',
    desc: 'See OpenSSF Scorecard status for every repo in your orgs at a glance — color-coded heatmap, sorted by urgency.',
  },
  {
    icon: Building2,
    title: 'Multi-Org Support',
    desc: 'Switch between personal repos and any GitHub organization you belong to. Shared org configs via .ossguard.yml.',
  },
  {
    icon: Filter,
    title: 'Smart Filtering',
    desc: 'Tabs for public, forked, and private repos. Search, sort by score or activity, and filter by language.',
  },
  {
    icon: Star,
    title: 'Favorites & Watchlist',
    desc: 'Pin repos you care about most. Include or exclude repos from analysis. Config syncs across devices via Gist.',
  },
  {
    icon: BarChart3,
    title: 'Scorecard Deep Dive',
    desc: 'Drill into 18+ individual OpenSSF checks per repo — see exactly what needs fixing and why.',
  },
  {
    icon: Settings,
    title: 'Zero Infrastructure',
    desc: '100% client-side. No backend, no database. Your GitHub token never leaves your browser.',
  },
];

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a GitHub Personal Access Token');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await fetchUser(token.trim());
      initOctokit(token.trim());
      setAuth(token.trim(), {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        html_url: user.html_url,
      });
    } catch {
      setError('Invalid token or network error. Check your token and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ─── Left panel: features + branding ─── */}
      <div className="hidden md:flex flex-1 flex-col justify-center py-8 px-10 lg:px-14 bg-blue-500/[0.03] border-r border-slate-800 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">OSSGuard Dashboard</span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            A <strong className="text-slate-200">zero-cost, client-side</strong> dashboard for tracking
            {' '}<strong className="text-slate-200">OpenSSF Scorecard</strong> security posture across
            all your GitHub repositories and organizations.
          </p>

          {/* Architecture diagram */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">How It Works</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-3">
                <GithubIcon className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-[10px] font-medium text-slate-300">Your GitHub Token</p>
                <p className="text-[9px] text-slate-500">repos, orgs, roles</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-3">
                <Layers className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                <p className="text-[10px] font-medium text-slate-300">Client-Side App</p>
                <p className="text-[9px] text-slate-500">no server needed</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-3">
                <Shield className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                <p className="text-[10px] font-medium text-slate-300">Scorecard API</p>
                <p className="text-[9px] text-slate-500">free, public</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-[9px] text-slate-600">5,000 req/hr per user</span>
              <span className="text-[9px] text-slate-700">|</span>
              <span className="text-[9px] text-slate-600">GitHub Pages hosted</span>
              <span className="text-[9px] text-slate-700">|</span>
              <span className="text-[9px] text-slate-600">Config via Gist</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-3.5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0 bg-blue-500/10 text-blue-400">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-200 mb-0.5">{f.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">
            Part of the <a href="https://github.com/kirankotari/ossguard" className="text-blue-500 hover:text-blue-400">OSSGuard</a> project.
            Powered by <a href="https://openssf.org" className="text-blue-500 hover:text-blue-400">OpenSSF</a> Scorecard API.
          </p>
        </div>
      </div>

      {/* ─── Right panel: sign in ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 md:max-w-[480px] md:min-w-[400px]">
        <div className="flex flex-col items-center gap-5 max-w-[380px] w-full">
          {/* Logo — mobile only */}
          <div className="flex items-center gap-3 md:hidden mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">OSSGuard</span>
          </div>

          <div className="text-center">
            <h1 className="text-[22px] font-bold text-white mb-1">Welcome to OSSGuard</h1>
            <p className="text-sm text-slate-400">
              Connect your GitHub account to get started
            </p>
          </div>

          {error && (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">GitHub Personal Access Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-[11px] text-slate-600 mt-1.5">
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:org,gist&description=OSSGuard+Dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400"
                >
                  Create a token
                </a>
                {' '}with{' '}
                <code className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">repo</code>,{' '}
                <code className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">read:org</code>,{' '}
                <code className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">gist</code> scopes
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <GithubIcon className="w-5 h-5" />
                  Connect GitHub
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Lock className="w-3 h-3" /> Token stays local
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Shield className="w-3 h-3" /> No server
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Activity className="w-3 h-3" /> Your API quota
            </div>
          </div>

          {/* EU CRA callout */}
          <div className="w-full mt-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3">
            <p className="text-[11px] font-semibold text-amber-400 mb-1">EU CRA Compliance</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              The EU Cyber Resilience Act requires open-source projects to meet security standards.
              OSSGuard Dashboard helps you track OpenSSF compliance across all your repositories
              so you can prioritize remediation efforts.
            </p>
          </div>

          <p className="text-[10px] text-slate-700 text-center leading-relaxed mt-2">
            Open source under Apache-2.0.
            Your token is never sent to any third-party server.
          </p>
        </div>
      </div>
    </div>
  );
}
