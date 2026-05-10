import { cn } from '../lib/cn';

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function ScoreBadge({ score, size = 'md', loading }: ScoreBadgeProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-full bg-slate-700 animate-pulse',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-12 h-12',
          size === 'lg' && 'w-16 h-16'
        )}
      />
    );
  }

  if (score === null || score === undefined) {
    return (
      <div
        className={cn(
          'rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-12 h-12',
          size === 'lg' && 'w-16 h-16'
        )}
      >
        <span className={cn('text-slate-500', size === 'sm' ? 'text-xs' : 'text-sm')}>N/A</span>
      </div>
    );
  }

  const color =
    score >= 7
      ? 'from-emerald-500 to-green-600 text-white'
      : score >= 4
        ? 'from-yellow-500 to-amber-600 text-white'
        : 'from-red-500 to-rose-600 text-white';

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center font-bold shadow-lg',
        color,
        size === 'sm' && 'w-8 h-8 text-xs',
        size === 'md' && 'w-12 h-12 text-base',
        size === 'lg' && 'w-16 h-16 text-xl'
      )}
    >
      {typeof score === 'number' ? score.toFixed(1) : score}
    </div>
  );
}
