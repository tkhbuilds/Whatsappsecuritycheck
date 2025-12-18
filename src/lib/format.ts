export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString();
}

export function titleCase(s: string): string {
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
