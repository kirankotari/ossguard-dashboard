import type { ScorecardResult } from '../store/dashboard';

const SCORECARD_API = 'https://api.scorecard.dev';

export async function fetchScorecard(
  repoFullName: string
): Promise<ScorecardResult | null> {
  try {
    const resp = await fetch(
      `${SCORECARD_API}/projects/github.com/${repoFullName}`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      repo: repoFullName,
      score: data.score ?? data.aggregate_score ?? 0,
      date: data.date ?? new Date().toISOString(),
      checks: (data.checks ?? []).map((c: any) => ({
        name: c.name,
        score: c.score ?? -1,
        reason: c.reason ?? '',
        details: c.details ?? null,
      })),
    };
  } catch {
    return null;
  }
}
