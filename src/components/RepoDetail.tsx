import { ArrowLeft, ExternalLink, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { useDashboardStore } from '../store/dashboard';
import ScoreBadge from './ScoreBadge';
import { cn } from '../lib/cn';

interface RepoDetailProps {
  repoFullName: string;
  onBack: () => void;
}

export default function RepoDetail({ repoFullName, onBack }: RepoDetailProps) {
  const { scores, repos } = useDashboardStore();
  const score = scores[repoFullName];
  const repo = repos.find((r) => r.full_name === repoFullName);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to repos
      </button>

      <div className="flex items-center gap-4 mb-8">
        <ScoreBadge score={score?.score ?? null} size="lg" />
        <div>
          <h2 className="text-2xl font-bold text-white">{repoFullName}</h2>
          {repo?.description && <p className="text-slate-400 mt-1">{repo.description}</p>}
          <a
            href={repo?.html_url ?? `https://github.com/${repoFullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
          >
            View on GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {score ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Scorecard Checks</h3>
          <div className="grid gap-2">
            {score.checks
              .sort((a, b) => a.score - b.score)
              .map((check) => (
                <div
                  key={check.name}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {check.score >= 7 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : check.score >= 4 ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : check.score >= 0 ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{check.name}</span>
                      <span
                        className={cn(
                          'text-sm font-bold',
                          check.score >= 7
                            ? 'text-emerald-400'
                            : check.score >= 4
                              ? 'text-yellow-400'
                              : check.score >= 0
                                ? 'text-red-400'
                                : 'text-slate-500'
                        )}
                      >
                        {check.score >= 0 ? `${check.score}/10` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{check.reason}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">
            No Scorecard data available for this repository.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Scorecard only works with public repositories on GitHub.
          </p>
        </div>
      )}
    </div>
  );
}
