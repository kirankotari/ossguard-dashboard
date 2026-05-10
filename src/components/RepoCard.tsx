import { useEffect } from 'react';
import { Star, ExternalLink, GitBranch, Clock, Eye, Lock } from 'lucide-react';
import type { Repo } from '../store/dashboard';
import { useDashboardStore } from '../store/dashboard';
import { fetchScorecard } from '../lib/scorecard';
import ScoreBadge from './ScoreBadge';
import { cn } from '../lib/cn';

interface RepoCardProps {
  repo: Repo;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const { scores, loadingScores, favorites, toggleFavorite, setScore, setLoadingScore } =
    useDashboardStore();

  const score = scores[repo.full_name];
  const isLoading = loadingScores[repo.full_name];
  const isFavorite = favorites.includes(repo.full_name);

  useEffect(() => {
    if (score || isLoading || repo.visibility === 'private') return;
    setLoadingScore(repo.full_name, true);
    fetchScorecard(repo.full_name)
      .then((result) => {
        if (result) setScore(repo.full_name, result);
      })
      .finally(() => setLoadingScore(repo.full_name, false));
  }, [repo.full_name]);

  const timeAgo = getTimeAgo(repo.pushed_at);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-blue-400 transition-colors truncate text-sm"
            >
              {repo.name}
            </a>
            <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          {repo.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{repo.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => toggleFavorite(repo.full_name)}
            className={cn(
              'p-1 rounded transition-colors',
              isFavorite
                ? 'text-yellow-400 hover:text-yellow-300'
                : 'text-slate-600 hover:text-slate-400'
            )}
          >
            <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>
          <ScoreBadge score={score?.score ?? null} size="sm" loading={isLoading} />
        </div>
      </div>

      {/* Score checks mini view */}
      {score && score.checks.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {score.checks.map((check) => (
            <div
              key={check.name}
              title={`${check.name}: ${check.score}/10 — ${check.reason}`}
              className={cn(
                'w-2.5 h-2.5 rounded-sm',
                check.score >= 7
                  ? 'bg-emerald-500'
                  : check.score >= 4
                    ? 'bg-yellow-500'
                    : check.score >= 0
                      ? 'bg-red-500'
                      : 'bg-slate-600'
              )}
            />
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          {repo.default_branch}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </span>
        {repo.visibility === 'private' ? (
          <Lock className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
