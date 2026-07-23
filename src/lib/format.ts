export function prettyToolContent(raw: string): string {
  try {
    const outer = JSON.parse(raw)
    if (outer && typeof outer === 'object' && typeof (outer as { text?: unknown }).text === 'string') {
      const inner = (outer as { text: string }).text
      try {
        return JSON.stringify(JSON.parse(inner), null, 2)
      } catch {
        return inner
      }
    }
    return JSON.stringify(outer, null, 2)
  } catch {
    return raw
  }
}

export function prettyArgs(args: unknown): string {
  if (typeof args === 'string') return args
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return String(args)
  }
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
