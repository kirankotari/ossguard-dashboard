import { useEffect } from 'react';
import { Shield, LogOut, User, Building2, Star } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useDashboardStore } from '../store/dashboard';
import { fetchOrgs, initOctokit } from '../lib/github';
import { cn } from '../lib/cn';

export default function TopBar() {
  const { user, token, logout } = useAuthStore();
  const { orgs, selectedOrg, setOrgs, setSelectedOrg } = useDashboardStore();

  useEffect(() => {
    if (!token) return;
    initOctokit(token);
    fetchOrgs().then(setOrgs).catch(console.error);
  }, [token]);

  const navItems = [
    { id: null, label: 'My Repos', icon: <User className="w-3.5 h-3.5" /> },
    { id: '__favorites__', label: 'Favorites', icon: <Star className="w-3.5 h-3.5" /> },
    ...orgs.map((org) => ({
      id: org.login,
      label: org.login,
      icon: org.avatar_url
        ? <img src={org.avatar_url} className="w-4 h-4 rounded" alt="" />
        : <Building2 className="w-3.5 h-3.5" />,
    })),
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 flex items-center h-13 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-white text-sm hidden sm:block">OSSGuard</span>
      </div>

      {/* Nav pills — scrollable on small screens */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id ?? '__me__'}
            onClick={() => setSelectedOrg(item.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
              selectedOrg === item.id
                ? item.id === '__favorites__'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <div className="flex items-center gap-2">
          {user?.avatar_url && (
            <img src={user.avatar_url} className="w-6 h-6 rounded-full" alt="" />
          )}
          <span className="text-xs font-medium text-slate-300 hidden md:block">
            {user?.name || user?.login}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}
