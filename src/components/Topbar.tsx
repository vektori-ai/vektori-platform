import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export function Topbar({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between border-b border-line bg-bg/90 px-6 backdrop-blur">
      <div className="flex min-w-0 items-center gap-1 text-[12.5px] text-dim">
        {crumbs.map((c, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="shrink-0 text-faint" />}
            {c.to ? (
              <Link to={c.to} className="truncate transition-colors hover:text-fg">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-fg">{c.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {actions}
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-bg"
          title="Laxman"
        >
          L
        </div>
      </div>
    </header>
  )
}
