import type { CheckResult } from '../db/schema';

export function computeScore(results: CheckResult[]): number {
  let score = 100;
  for (const r of results) {
    if (r.status === 'fail') score -= r.weight;
  }
  return Math.max(0, Math.min(100, score));
}

export function topFixes(results: CheckResult[], limit: number): CheckResult[] {
  return results
    .filter((r) => r.status === 'fail')
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.key.localeCompare(b.key);
    })
    .slice(0, limit);
}
