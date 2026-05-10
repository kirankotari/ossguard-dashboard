import { useState } from 'react';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import { useAuthStore } from '../store/auth';
import { fetchUser, initOctokit } from '../lib/github';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">OSSGuard Dashboard</h1>
          <p className="text-slate-400">
            Bird's eye view of OpenSSF security posture across your repositories
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <GithubIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Sign in with GitHub</h2>
          </div>

          <p className="text-sm text-slate-400 mb-4">
            Enter a{' '}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,read:org&description=OSSGuard+Dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Personal Access Token
            </a>{' '}
            with <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">repo</code>{' '}
            and <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">read:org</code> scopes.
          </p>

          <div className="space-y-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  Connect <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500">
              Your token is stored locally in your browser and never sent to any server.
              All API calls go directly from your browser to GitHub and Scorecard APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
