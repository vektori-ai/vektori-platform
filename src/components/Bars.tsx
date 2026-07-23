/** Thin horizontal progress bar. */
export function Progress({ pct, tone = 'accent' }: { pct: number; tone?: 'accent' | 'ok' | 'warn' | 'err' }) {
  const fill = { accent: 'bg-accent', ok: 'bg-ok', warn: 'bg-warn', err: 'bg-err' }[tone]
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-raise">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

/** Labeled horizontal bar list — replaces chart libraries for tool usage etc. */
export function UsageBars({
  items,
  labelWidth = 'w-44',
}: {
  items: { name: string; count: number }[]
  labelWidth?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-3">
          <span className={`${labelWidth} shrink-0 truncate text-right font-mono text-[11.5px] text-mid`} title={i.name}>
            {i.name}
          </span>
          <div className="h-[13px] flex-1 overflow-hidden rounded-sm bg-raise">
            <div className="h-full rounded-sm bg-accent/70" style={{ width: `${(i.count / max) * 100}%` }} />
          </div>
          <span className="tnum w-8 shrink-0 text-right font-mono text-[11.5px] text-mid">{i.count}</span>
        </li>
      ))}
    </ul>
  )
}

/** Stacked two-segment bar list (e.g. passed / failed per developer). */
export function StackedBars({
  items,
}: {
  items: { label: string; a: number; b: number }[]
}) {
  const max = Math.max(1, ...items.map((i) => i.a + i.b))
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-right font-mono text-[11.5px] text-mid" title={i.label}>
            {i.label}
          </span>
          <div className="flex h-[13px] flex-1 gap-px overflow-hidden rounded-sm bg-raise">
            {i.a > 0 && <div className="h-full bg-ok/80" style={{ width: `${(i.a / max) * 100}%` }} />}
            {i.b > 0 && <div className="h-full bg-warn/70" style={{ width: `${(i.b / max) * 100}%` }} />}
          </div>
          <span className="tnum w-12 shrink-0 text-right font-mono text-[11.5px] text-dim">
            {i.a}/{i.a + i.b}
          </span>
        </li>
      ))}
    </ul>
  )
}
