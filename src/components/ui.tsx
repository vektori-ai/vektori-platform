import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Topbar, type Crumb } from './Topbar'

/** Page shell: topbar + centered content column with consistent gutters. */
export function Page({ crumbs, actions, children }: { crumbs: Crumb[]; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <Topbar crumbs={crumbs} actions={actions} />
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-16">{children}</div>
    </>
  )
}

export function Button({
  children,
  variant = 'secondary',
  onClick,
  disabled,
  title,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  title?: string
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-md px-3 py-[7px] text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'
  const variants = {
    primary: 'bg-accent text-bg hover:bg-accent-hi',
    secondary: 'border border-line-2 bg-surface text-mid hover:border-line-2 hover:bg-raise hover:text-fg',
    ghost: 'text-mid hover:bg-surface hover:text-fg',
  }
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  width = 'w-64',
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width?: string
}) {
  return (
    <div className="relative">
      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${width} rounded-md border border-line bg-surface py-[7px] pl-8 pr-3 text-[12.5px] text-fg shadow-xs placeholder:text-faint focus:border-faint focus:outline-none`}
      />
    </div>
  )
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  counts?: Partial<Record<T, number>>
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-line bg-surface p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded px-2.5 py-[5px] text-[12px] font-medium capitalize transition-colors ${
            value === opt ? 'bg-raise text-fg' : 'text-dim hover:text-mid'
          }`}
        >
          {opt}
          {counts?.[opt] !== undefined && <span className="tnum ml-1.5 text-[11px] text-dim">{counts[opt]}</span>}
        </button>
      ))}
    </div>
  )
}

export function Card({ title, children, pad = true }: { title?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface shadow-xs">
      {title && (
        <div className="border-b border-line px-4 py-2.5 text-[12.5px] font-semibold text-fg">{title}</div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </div>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-4 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px flex items-center gap-1.5 border-b-2 px-0.5 pb-2.5 text-[13px] font-medium transition-colors ${
            value === t.id ? 'border-accent text-fg' : 'border-transparent text-dim hover:text-mid'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="tnum rounded bg-raise px-1.5 py-px text-[11px] text-dim">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
