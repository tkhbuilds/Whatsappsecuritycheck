export async function sha256HexFromFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function nowIso(): string {
  return new Date().toISOString();
}
