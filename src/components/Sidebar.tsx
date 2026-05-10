import { useEffect } from 'react';
import { Shield, LogOut, User, Building2, Star } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useDashboardStore } from '../store/dashboard';
import { fetchOrgs, initOctokit } from '../lib/github';
import { cn } from '../lib/cn';

export default function Sidebar() {
  const { user, token, logout } = useAuthStore();
  const { orgs, selectedOrg, setOrgs, setSelectedOrg } = useDashboardStore();

  useEffect(() => {
    if (!token) return;
    initOctokit(token);
    fetchOrgs().then(setOrgs).catch(console.error);
  }, [token]);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">OSSGuard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => setSelectedOrg(null)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            selectedOrg === null
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          )}
        >
          <User className="w-4 h-4" />
          My Repositories
        </button>

        <button
          onClick={() => setSelectedOrg('__favorites__')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            selectedOrg === '__favorites__'
              ? 'bg-yellow-600/20 text-yellow-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          )}
        >
          <Star className="w-4 h-4" />
          Favorites
        </button>

        {orgs.length > 0 && (
          <div className="pt-3">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Organizations
            </p>
            {orgs.map((org) => (
              <button
                key={org.login}
                onClick={() => setSelectedOrg(org.login)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedOrg === org.login
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {org.avatar_url ? (
                  <img src={org.avatar_url} className="w-5 h-5 rounded" alt="" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
                <span className="truncate">{org.login}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.avatar_url && (
            <img src={user.avatar_url} className="w-8 h-8 rounded-full" alt="" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.login}</p>
            <p className="text-xs text-slate-500 truncate">@{user?.login}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
