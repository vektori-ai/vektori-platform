import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-line bg-surface shadow-xs px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-dim">{label}</span>
        {icon && <span className="text-faint">{icon}</span>}
      </div>
      <div className="tnum mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-fg">{value}</div>
      {sub && <div className="mt-0.5 text-[12px] text-dim">{sub}</div>}
    </div>
  )
}

/** Inline key/value stat used in dense header strips. */
export function StatInline({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[11px] font-medium text-dim">{label}</span>
      <span className="tnum truncate font-mono text-[13px] font-medium text-fg">{value}</span>
    </div>
  )
}
